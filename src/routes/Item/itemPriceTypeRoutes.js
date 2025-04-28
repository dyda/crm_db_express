const express = require('express');
const router = express.Router();
const ItemPriceTypeController = require('../../controllers/Item/ItemPriceTypeController');
const authenticate = require('../../middlewares/authMiddleware');

// Create an item price type
router.post('/store', authenticate, ItemPriceTypeController.createItemPriceType);

// Get all item price types
router.get('/index', authenticate, ItemPriceTypeController.getAllItemPriceTypes);

// Get an item price type by ID
router.get('/show/:id', authenticate, ItemPriceTypeController.getItemPriceTypeById);

// Update an item price type
router.put('/update/:id', authenticate, ItemPriceTypeController.updateItemPriceType);

// Soft delete an item price type
router.delete('/delete/:id', authenticate, ItemPriceTypeController.deleteItemPriceType);

module.exports = router;