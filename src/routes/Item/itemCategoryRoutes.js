const express = require('express');
const router = express.Router();
const ItemCategoryController = require('../../controllers/Item/ItemCategoryController');
const authenticate = require('../../middlewares/authMiddleware');

// Create an item category
router.post('/store', authenticate, ItemCategoryController.createItemCategory);

// Get all item categories
router.get('/index', authenticate, ItemCategoryController.getAllItemCategories);

// Get an item category by ID
router.get('/show/:id', authenticate, ItemCategoryController.getItemCategoryById);

// Update an item category
router.put('/update/:id', authenticate, ItemCategoryController.updateItemCategory);

// Soft delete an item category
router.delete('/delete/:id', authenticate, ItemCategoryController.deleteItemCategory);

module.exports = router;