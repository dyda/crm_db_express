const express = require('express');
const router = express.Router();

// Company & Capital
const companyRoutes = require('./Company/companyRoutes');
const capitalRoutes = require('./Capital/capitalRoutes');

// Branch, Warehouse, City, Zone, Region
const branchRoutes = require('./Branch/branchRoutes');
const warehouseRoutes = require('./Warehouse/warehouseRoutes');
const cityRoutes = require('./City/cityRoutes');
const zoneRoutes = require('./Zone/zoneRoutes');
const regionRoutes = require('./Region/regionRoutes');

// Customer
const customerRoutes = require('./Customer/customerRoutes');
const customerCategoryRoutes = require('./Customer/customerCategoryRoutes');
const customerPaymentRoutes = require('./Customer/customerPaymentRoutes');

// User & Salary
const userRoutes = require('./User/userRoutes');
const salaryRoutes = require('./Salary/salaryRoutes');

// Expenses
const expensesCategoryRoutes = require('./Expenses/expensesCategoryRoutes');
const expensesRoutes = require('./Expenses/expensesRoutes');

// Item
const itemRoutes = require('./Item/itemRoutes');
const itemQuantityRoutes = require('./Item/itemQuantityRoutes');
const itemBrandRoutes = require('./Item/itemBrandRoutes');
const itemCategoryRoutes = require('./Item/itemCategoryRoutes');
const itemUnitRoutes = require('./Item/itemUnitRoutes');
const itemPriceTypeRoutes = require('./Item/itemPriceTypeRoutes');
const itemPriceRoutes = require('./Item/itemPriceRoutes');
const itemTransferRoutes = require('./Item/itemTransferRoutes');
const itemTransactionRoutes = require('./Item/itemTransactionRoutes');

// Currency
const currencyRoutes = require('./Currency/currencyRoutes');
const currencyRateRoutes = require('./CurrencyRate/currencyRateRoutes');

// Buy Invoice
const buyInvoiceRoutes = require('./Buy/buyInvoiceRoutes');
const buyItemRoutes = require('./Buy/buyItemRoutes');

// Route usage
router.use('/company', companyRoutes);
router.use('/capital', capitalRoutes);

router.use('/branch', branchRoutes);
router.use('/warehouse', warehouseRoutes);
router.use('/city', cityRoutes);
router.use('/zone', zoneRoutes);
router.use('/region', regionRoutes);

router.use('/customer', customerRoutes);
router.use('/customer-category', customerCategoryRoutes);
router.use('/payments', customerPaymentRoutes);

router.use('/user', userRoutes);
router.use('/salary', salaryRoutes);

router.use('/expenses-category', expensesCategoryRoutes);
router.use('/expenses', expensesRoutes);

router.use('/item', itemRoutes);
router.use('/item-quantity', itemQuantityRoutes);
router.use('/item-brand', itemBrandRoutes);
router.use('/item-category', itemCategoryRoutes);
router.use('/item-unit', itemUnitRoutes);
router.use('/item-price-type', itemPriceTypeRoutes);
router.use('/item-price', itemPriceRoutes);
router.use('/item-transfer', itemTransferRoutes);
router.use('/item-transaction', itemTransactionRoutes);

router.use('/currency', currencyRoutes);
router.use('/currency-rates', currencyRateRoutes);

router.use('/buy-invoice', buyInvoiceRoutes);
router.use('/buy-item', buyItemRoutes);

module.exports = router;