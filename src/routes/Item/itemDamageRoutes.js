const express = require('express');
const router = express.Router();
const ItemDamageController = require('../../controllers/Item/ItemDamageController');
const authenticate = require('../../middlewares/authMiddleware');

router.post('/store', authenticate, ItemDamageController.create);
router.get('/index', authenticate, ItemDamageController.getAll);
router.get('/show/:id', authenticate, ItemDamageController.getById);
router.get('/filter', authenticate, ItemDamageController.getByFilters);
router.put('/update/:id', authenticate, ItemDamageController.update);
router.delete('/delete/:id', authenticate, ItemDamageController.deleteSoft);

module.exports = router;