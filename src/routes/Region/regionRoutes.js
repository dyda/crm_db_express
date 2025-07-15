const express = require('express');
const router = express.Router();
const RegionController = require('../../controllers/Region/RegionController');
const authenticate = require('../../middlewares/authMiddleware');

// Create
router.post('/store', authenticate, RegionController.create);

// Get all
router.get('/index', authenticate, RegionController.getAll);

// Filter
router.get('/filter', authenticate, RegionController.filter);

// Get by id
router.get('/:id', authenticate, RegionController.getById);

// Update
router.put('/update/:id', authenticate, RegionController.update);

// Soft delete
router.delete('/delete/:id', authenticate, RegionController.delete);



module.exports = router;