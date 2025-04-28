const express = require('express');
const router = express.Router();
const ItemTransferController = require('../../controllers/Item/ItemTransferController');
const authenticate = require('../../middlewares/authMiddleware');

// Create an item transfer
router.post('/store', authenticate, ItemTransferController.createTransfer);

// Get all item transfers
router.get('/index', authenticate, ItemTransferController.getAllTransfers);

// Get an item transfer by ID
router.get('/show/:id', authenticate, ItemTransferController.getTransferById);

// Get item transfers by filters
router.get('/filter', authenticate, ItemTransferController.getTransfersByFilters);

// Update an item transfer
router.put('/update/:id', authenticate, ItemTransferController.updateTransfer);

// Soft delete an item transfer
router.delete('/delete/:id', authenticate, ItemTransferController.deleteTransfer);

module.exports = router;