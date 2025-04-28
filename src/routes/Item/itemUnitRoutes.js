const express = require('express');
const router = express.Router();
const ItemUnitController = require('../../controllers/Item/ItemUnitController');
const authenticate = require('../../middlewares/authMiddleware');

// Create an item unit
router.post('/store', authenticate, ItemUnitController.createItemUnit);

// Get all item units
router.get('/index', authenticate, ItemUnitController.getAllItemUnits);

// Get an item unit by ID
router.get('/show/:id', authenticate, ItemUnitController.getItemUnitById);

// Update an item unit
router.put('/update/:id', authenticate, ItemUnitController.updateItemUnit);

// Soft delete an item unit
router.delete('/delete/:id', authenticate, ItemUnitController.deleteItemUnit);

module.exports = router;