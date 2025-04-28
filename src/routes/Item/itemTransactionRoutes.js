const express = require('express');
const router = express.Router();
const ItemTransactionController = require('../../controllers/Item/ItemTransactionController');
const authenticate = require('../../middlewares/authMiddleware');

// Create an item transaction
router.post('/store', authenticate, ItemTransactionController.createTransaction);

// Get all item transactions
router.get('/index', authenticate, ItemTransactionController.getAllTransactions);

// Get an item transaction by ID
router.get('/show/:id', authenticate, ItemTransactionController.getTransactionById);
// Get item transactions by filters
router.get('/filter', authenticate, ItemTransactionController.getTransactionsByFilters);

// Update an item transaction
router.put('/update/:id', authenticate, ItemTransactionController.updateTransaction);

// Soft delete an item transaction
router.delete('/delete/:id', authenticate, ItemTransactionController.deleteTransaction);

module.exports = router;