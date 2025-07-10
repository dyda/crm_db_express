const express = require('express');
const router = express.Router();
const CurrencyRateController = require('../../controllers/CurrencyRate/CurrencyRateController');
const authenticate = require('../../middlewares/authMiddleware');

// Create (register new rate)
router.post('/store', authenticate, CurrencyRateController.create);

// Get all rates
router.get('/index', authenticate, CurrencyRateController.getAll);

// Get rate by ID
router.get('/show/:id', authenticate, CurrencyRateController.getById);

// Update rate by ID
router.put('/update/:id', authenticate, CurrencyRateController.update);

// Delete rate by ID (soft delete)
router.delete('/delete/:id', authenticate, CurrencyRateController.delete);

// Get rate history by currency_id
router.get('/history/:currency_id', authenticate, CurrencyRateController.getHistory);

module.exports = router;