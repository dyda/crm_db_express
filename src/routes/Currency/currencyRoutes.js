const express = require('express');
const router = express.Router();
const CurrencyController = require('../../controllers/Currency/CurrencyController');
const authenticate=require('../../middlewares/authMiddleware');

router.post('/store', authenticate, CurrencyController.create);
router.get('/index', authenticate, CurrencyController.getAll);
router.get('/show/:id', authenticate, CurrencyController.getById);
router.get('/base', authenticate, CurrencyController.getBaseCurrency);
router.put('/update/:id', authenticate, CurrencyController.update);
router.delete('/delete/:id', authenticate, CurrencyController.delete);

module.exports = router;