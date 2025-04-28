const express = require('express');
const router = express.Router();
const SalaryController = require('../../controllers/User/SalaryController');
const authenticate=require('../../middlewares/authMiddleware');

// Create a Salaru category
router.post('/store', authenticate,SalaryController.createSalary);

// Get all Salaru categories
router.get('/index', authenticate,SalaryController.getAllSalaries);

// Get a customer category by ID
router.get('/show/:id', authenticate,SalaryController.getSalaryById);

// Get Salaru by Date Range
router.get('/show-date', SalaryController.getSalariesByDateRange);

// Update a Salaru category
router.put('/update/:id', authenticate,SalaryController.updateSalary);

// Soft delete a Salaru category
router.delete('/delete/:id', authenticate,SalaryController.deleteSalary);

module.exports = router;