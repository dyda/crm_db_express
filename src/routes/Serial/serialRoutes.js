const express = require('express');
const router = express.Router();
const SerialController = require('../../controllers/Serial/SerialController');
const authenticate = require('../../middlewares/authMiddleware');
// Create
router.post('/store', authenticate, SerialController.create);

// Read all
router.get('/index', authenticate, SerialController.getAll);

// Read one
router.get('/show/:id', authenticate, SerialController.getById);

// Filter with pagination and sort
router.get('/filter', authenticate, SerialController.getByFilters);
// Update
router.put('/update/:id', authenticate, SerialController.update);

// Soft delete
router.delete('/delete/:id', authenticate, SerialController.deleteSoft);



module.exports = router;