const express = require('express');
const router = express.Router();
const CustomerController = require('../../controllers/Customer/CustomerController');
const authenticate = require('../../middlewares/authMiddleware');

// Create a customer
router.post('/store', authenticate,CustomerController.create);

// Get all customers
router.get('/index', authenticate,CustomerController.getAll);

// Get a customer by ID
router.get('/show/:id', authenticate,CustomerController.getById);

// Update a customer
router.put('/update/:id', authenticate,CustomerController.update);

// Soft delete a customer
router.delete('/delete/:id', authenticate,CustomerController.delete);


module.exports = router;