const express = require('express');
const router = express.Router();
const CurrencyConverterController = require('../../controllers/Currency/CurrencyConvertController');
const authenticate=require('../../middlewares/authMiddleware');

router.post('/store', authenticate, CurrencyConverterController.create);
router.get('/index', authenticate, CurrencyConverterController.getAll);
router.get('/show/:id', authenticate, CurrencyConverterController.getById);
router.put('/update/:id', authenticate, CurrencyConverterController.update);
router.delete('/delete/:id', authenticate, CurrencyConverterController.delete);

module.exports = router;