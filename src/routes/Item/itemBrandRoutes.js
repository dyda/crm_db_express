const express = require('express');
const router = express.Router();
const ItemBrandController = require('../../controllers/Item/ItemBrandController');
const authenticate = require('../../middlewares/authMiddleware');

// Create an item brand
router.post('/store', authenticate, ItemBrandController.createItemBrand);

// Get all item brands
router.get('/index', authenticate, ItemBrandController.getAllItemBrands);

// Get an item brand by ID
router.get('/show/:id', authenticate, ItemBrandController.getItemBrandById);

// Update an item brand
router.put('/update/:id', authenticate, ItemBrandController.updateItemBrand);

// Soft delete an item brand
router.delete('/delete/:id', authenticate, ItemBrandController.deleteItemBrand);

module.exports = router;