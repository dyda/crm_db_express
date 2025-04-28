const express = require('express');
const router = express.Router();
const RegionController = require('../../controllers/Region/RegionController');
const authenticate = require('../../middlewares/authMiddleware');

// Create a region
router.post('/store', authenticate, RegionController.createRegion);

// Get all regions
router.get('/index', authenticate, RegionController.getAllRegions);

// Get a region by ID
router.get('/show/:id', authenticate, RegionController.getRegionById);

// Update a region
router.put('/update/:id', authenticate, RegionController.updateRegion);

// Soft delete a region
router.delete('/delete/:id', authenticate, RegionController.deleteRegion);

module.exports = router;