const express = require('express');
const router = express.Router();
const ItemController = require('../../controllers/Item/ItemController');
const authenticate = require('../../middlewares/authMiddleware');

// Create an item
router.post('/store', authenticate, ItemController.createItem);

// Get all items
router.get('/index', authenticate, ItemController.getAllItems);

// Get an item by ID
router.get('/show/:id', authenticate, ItemController.getItemById);

// Update an item
router.put('/update/:id', authenticate, ItemController.updateItem);

// Soft delete an item
router.delete('/delete/:id', authenticate, ItemController.deleteItem);

module.exports = router;