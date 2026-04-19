require('dotenv').config()

const express  = require('express')
const http     = require('http')
const cors     = require('cors')
const { Server } = require('socket.io')

const pool   = require('./db')
const routes = require('./routes/index')

const app    = express()
const server = http.createServer(app)
const io     = new Server(server, { cors: { origin: '*' } })

const PORT = process.env.PORT || 3001


app.use(cors())
app.use(express.json())

// Store the io instance on the app so controllers can use it
// Usage in a controller: const io = req.app.get('io')
app.set('io', io)

//Routes 

app.use('/api', routes)

//Socket.io 

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id)

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id)
  })
})

// Simulator 
// Every 1.5 seconds:
//   1. Get all animals from the database
//   2. Move each animal a little bit (random walk)
//      OR move it fast in one direction if panic mode is on
//   3. Check if the animal is still inside the safe zone (using PostGIS)
//   4. Save the new position to the database
//   5. Send all positions to the React frontend via Socket.io

const TICK_MS = 1500          // how often the simulator runs (milliseconds)
const STEP    = 0.0005        // how far an animal moves each tick (in degrees)
const PANIC_SPEED = 8         // how many times faster in panic mode

setInterval(async () => {
  try {
    // Step 1 — get all animals
    const animalsResult = await pool.query(`
      SELECT id, name, is_panic, panic_direction,
             ST_X(current_location) AS longitude,
             ST_Y(current_location) AS latitude,
             speed
      FROM animals
    `)

    const animals = animalsResult.rows

    if (animals.length === 0) return

    // Step 2 & 3 & 4 — move each animal, check geofence, save to DB
    const updatedAnimals = []

    for (const animal of animals) {
      let newLng, newLat

      if (animal.is_panic && animal.panic_direction) {
        // Panic mode: move fast in the stored escape direction
        const dir = animal.panic_direction  // already parsed by pg as an object
        newLng = parseFloat(animal.longitude) + dir.dx * STEP * PANIC_SPEED
        newLat = parseFloat(animal.latitude)  + dir.dy * STEP * PANIC_SPEED
      } else {
        // Normal mode: move a tiny random amount in any direction
        newLng = parseFloat(animal.longitude) + (Math.random() * 2 - 1) * STEP
        newLat = parseFloat(animal.latitude)  + (Math.random() * 2 - 1) * STEP
      }

      // Check if the new position is inside the safe zone
      // ST_Within returns true or false
      const geoCheck = await pool.query(`
        SELECT ST_Within(
          ST_SetSRID(ST_MakePoint($1, $2), 4326),
          zone
        ) AS is_inside
        FROM geofences
        LIMIT 1
      `, [newLng, newLat])

      const isInside = geoCheck.rows[0]?.is_inside ?? false
      const newStatus = isInside ? 'safe' : 'alert'

      // Save the new position to the database
      await pool.query(`
        UPDATE animals
        SET current_location = ST_SetSRID(ST_MakePoint($1, $2), 4326),
            status = $3
        WHERE id = $4
      `, [newLng, newLat, newStatus, animal.id])

      updatedAnimals.push({
        id:        animal.id,
        name:      animal.name,
        longitude: newLng,
        latitude:  newLat,
        status:    newStatus,
        is_panic:  animal.is_panic,
      })
    }

    // Step 5 — send all updated positions to the frontend
    io.emit('LOCATION_UPDATE', updatedAnimals)

    // Also send an alert if any animal left the safe zone
    for (const animal of updatedAnimals) {
      if (animal.status === 'alert') {
        io.emit('GEOFENCE_ALERT', {
          message: `${animal.name} has left the safe zone!`,
          animal: animal,
        })
      }
    }

  } catch (error) {
    console.error('Simulator error:', error.message)
  }

}, TICK_MS)

// Start the server

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})