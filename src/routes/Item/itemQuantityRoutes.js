const express = require('express');
const router = express.Router();
const ItemQuantityController = require('../../controllers/Item/ItemQuantityController');
const authenticate = require('../../middlewares/authMiddleware');

// Create an item quantity
router.post('/store', authenticate, ItemQuantityController.createItemQuantity);

// Get all item quantities
router.get('/index', authenticate, ItemQuantityController.getAllItemQuantities);

// Get an item quantity by ID
router.get('/show/:id', authenticate, ItemQuantityController.getItemQuantityById);

// Update an item quantity
router.put('/update/:id', authenticate, ItemQuantityController.updateItemQuantity);

// Soft delete an item quantity
router.delete('/delete/:id', authenticate, ItemQuantityController.deleteItemQuantity);

module.exports = router;