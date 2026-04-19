// routes/index.js
// All API routes in one place.

const express = require('express')
const router  = express.Router()

const { getAllAnimals, createAnimal, deleteAnimal, activatePanic, deactivatePanic } = require('../controllers/animalController')
const { getGeofence, checkIfInsideZone } = require('../controllers/geofenceController')

// Animal routes
router.get('/animals',          getAllAnimals)
router.post('/animals',         createAnimal)
router.delete('/animals/:id',   deleteAnimal)
router.post('/animals/panic',   activatePanic)
router.post('/animals/calm',    deactivatePanic)

// Geofence routes
router.get('/geofence',         getGeofence) 
router.post('/geofence/check',  checkIfInsideZone)

module.exports = router