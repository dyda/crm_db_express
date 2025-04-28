const express = require('express');
const router = express.Router();
const CapitalController = require('../../controllers/Capital/CapitalController');
const authenticate = require('../../middlewares/authMiddleware');

// Create a capital
router.post('/store', authenticate, CapitalController.createCapital);

// Get all capitals
router.get('/index', authenticate, CapitalController.getAllCapitals);

// Get a capital by ID
router.get('/show/:id', authenticate, CapitalController.getCapitalById);

// Update a capital
router.put('/update/:id', authenticate, CapitalController.updateCapital);

// Soft delete a capital
router.delete('/delete/:id', authenticate, CapitalController.deleteCapital);

module.exports = router;