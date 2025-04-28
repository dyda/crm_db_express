const express = require('express');
const router = express.Router();
const BuyItemController = require('../../controllers/Buy/BuyItemController');

router.post('/store', BuyItemController.createBuyItem);
router.get('/index', BuyItemController.getAllBuyItems);
router.get('/:id', BuyItemController.getBuyItemById);
router.put('/update/:id', BuyItemController.updateBuyItem);
router.delete('/delete/:id', BuyItemController.deleteBuyItem);

module.exports = router;