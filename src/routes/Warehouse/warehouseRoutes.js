const express = require('express');
const router = express.Router();
const WarehouseController = require('../../controllers/Warehouse/WarehouseController');
const authenticate=require('../../middlewares/authMiddleware');
// Create a warehouse
router.post('/store',authenticate, WarehouseController.create);            

// Get all warehouse
router.get('/index', authenticate,WarehouseController.getAll);             
router.get('/filter', WarehouseController.filter);

// Get a warehouse by ID
router.get('/show/:id', authenticate,WarehouseController.getById);         

// Update a warehouse
router.put('/update/:id', authenticate,WarehouseController.update);        

// Soft delete a warehouse
router.delete('/delete/:id', authenticate,WarehouseController.delete);    

// Get all warehouse by branch_id
router.get('/branch/:branch_id', authenticate,WarehouseController.getBranchWarehouse);

module.exports = router;
