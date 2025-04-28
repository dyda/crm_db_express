const express = require('express');
const router = express.Router();
const BuyInvoiceController = require('../../controllers/Buy/BuyInvoiceController');
const authenticate = require('../../middlewares/authMiddleware');

// Create a buy invoice
router.post('/store', authenticate, BuyInvoiceController.createInvoice);

// Get all buy invoices
router.get('/index', authenticate, BuyInvoiceController.getAllInvoices);

// Get a buy invoice by ID
router.get('/show/:id', authenticate, BuyInvoiceController.getInvoiceById);

// Get buy invoices by filters
router.get('/filter', authenticate, BuyInvoiceController.getInvoicesByFilters);

// Update a buy invoice
router.put('/update/:id', authenticate, BuyInvoiceController.updateInvoice);

// Soft delete a buy invoice
router.delete('/delete/:id', authenticate, BuyInvoiceController.deleteInvoice);

module.exports = router;