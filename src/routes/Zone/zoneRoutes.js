const express = require('express');
const router = express.Router();
const ZoneController = require('../../controllers/Zone/ZoneController');
const authenticate = require('../../middlewares/authMiddleware');

// Create a customer zone
router.post('/store', authenticate, ZoneController.createZone);

// Get all customer zones
router.get('/index', authenticate, ZoneController.getAllZones);

// Get a customer zone by ID
router.get('/show/:id', authenticate, ZoneController.getZoneById);

// Update a customer zone
router.put('/update/:id', authenticate, ZoneController.updateZone);

// Soft delete a customer zone
router.delete('/delete/:id', authenticate, ZoneController.deleteZone);

module.exports = router;