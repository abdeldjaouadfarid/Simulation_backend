// controllers/animalController.js
// All the logic for animals: add, remove, get, and panic mode.

const pool = require('../db')

// GET /api/animals 
// Return all animals from the database.
// ST_X and ST_Y extract the longitude and latitude from the PostGIS point.
const getAllAnimals = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        species,
        ST_X(current_location) AS longitude,
        ST_Y(current_location) AS latitude,
        speed,
        status,
        is_panic
      FROM animals
    `)

    res.json(result.rows)

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// POST /api/animals 
// Add a new animal.
// Body: { name, species, longitude, latitude }
//
// ST_MakePoint(longitude, latitude) creates a PostGIS point.
// ST_SetSRID(..., 4326) tells PostGIS we are using GPS coordinates (WGS-84).
const createAnimal = async (req, res) => {
  try {
    const { name, species, longitude, latitude } = req.body

    if (!name || !species || !longitude || !latitude) {
      return res.status(400).json({ message: 'Please provide name, species, longitude and latitude.' })
    }

    const result = await pool.query(`
      INSERT INTO animals (name, species, current_location)
      VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326))
      RETURNING id, name, species, ST_X(current_location) AS longitude, ST_Y(current_location) AS latitude, status
    `, [name, species, longitude, latitude])

    res.status(201).json(result.rows[0])

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// DELETE /api/animals/:id 
// Remove an animal by its id.
const deleteAnimal = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query('DELETE FROM animals WHERE id = $1', [id])

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Animal not found.' })
    }

    res.json({ message: `Animal ${id} deleted.` })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

//  POST /api/animals/panic 
// Activate panic (theft) mode for all animals.
// This sets is_panic = true and saves a random direction to run towards.
const activatePanic = async (req, res) => {
  try {
    // Pick a random escape direction (a random angle in radians)
    const angle = Math.random() * 2 * Math.PI
    const direction = { dx: Math.cos(angle), dy: Math.sin(angle) }

    await pool.query(`
      UPDATE animals
      SET is_panic = true, panic_direction = $1, status = 'stolen'
    `, [JSON.stringify(direction)])

    // Tell all connected React clients about the panic
    const io = req.app.get('io')
    io.emit('PANIC_ACTIVATED', { message: 'Panic mode ON! Animals are being stolen.' })

    res.json({ message: 'Panic mode activated for all animals.' })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

//  POST /api/animals/calm 
// Deactivate panic mode. Animals go back to random walk.
const deactivatePanic = async (req, res) => {
  try {
    await pool.query(`
      UPDATE animals
      SET is_panic = false, panic_direction = NULL, status = 'safe'
    `)

    const io = req.app.get('io')
    io.emit('PANIC_DEACTIVATED', { message: 'Panic mode OFF. Animals are calm.' })

    res.json({ message: 'Panic mode deactivated.' })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports ={
        getAllAnimals,
        createAnimal,
        deleteAnimal,
        activatePanic,
        deactivatePanic
    }