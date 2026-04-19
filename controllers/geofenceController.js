// controllers/geofenceController.js
// Logic for the safe zone (geofence): get it and create it.

const pool = require('../db')

//  GET /api/geofence 
// Return the safe zone stored in the database.
// ST_AsGeoJSON converts the PostGIS polygon into a JSON object the frontend can use.
const getGeofence = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, ST_AsGeoJSON(zone)::json AS zone
      FROM geofences
      LIMIT 1
    `)

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No geofence found.' })
    }

    res.json(result.rows[0])

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

//  POST /api/geofence/check 
// Check if a given point is inside the safe zone.
// Body: { longitude, latitude }
//
// ST_Within(point, polygon) returns true if the point is inside the polygon.
// We build the point on the fly with ST_MakePoint — no need to save it first.
const checkIfInsideZone = async (req, res) => {
  try {
    const { longitude, latitude } = req.body

    if (!longitude || !latitude) {
      return res.status(400).json({ message: 'Please provide longitude and latitude.' })
    }

    const result = await pool.query(`
      SELECT
        name,
        ST_Within(
          ST_SetSRID(ST_MakePoint($1, $2), 4326),
          zone
        ) AS is_inside
      FROM geofences
      LIMIT 1
    `, [longitude, latitude])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No geofence found.' })
    }

    res.json({
      longitude,
      latitude,
      is_inside: result.rows[0].is_inside,
      zone_name: result.rows[0].name,
    })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { getGeofence, checkIfInsideZone }