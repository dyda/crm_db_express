const express = require('express');
const router = express.Router();

// Import the routes
const companyRoutes = require('./Company/companyRoutes');  // Adjust the path if needed
const capitalRoutes = require('./Capital/capitalRoutes');  
const branchRoutes = require('./Branch/branchRoutes');  
const cityRoutes = require('./City/cityRoutes');  
const zoneRoutes = require('./Zone/zoneRoutes');  // Adjust the path if needed // Adjust the path if needed
const regionRoutes = require('./Region/regionRoutes'); 

// Adjust the path if needed // Adjust the path if needed
// Adjust the path if needed
const warehouseRoutes = require('./Warehouse/warehouseRoutes');  // Adjust the path if needed
const customerRoutes = require('./Customer/customerRoutes'); 
const customerCategoryRoutes = require('./Customer/customerCategoryRoutes');  // Adjust the path if needed // Adjust the path if needed
const customerPaymentRoutes = require('./Customer/customerPaymentRoutes'); 

const userRoutes = require('./User/userRoutes');  // Adjust the path if needed
const salaryRoutes = require('./User/salaryRoutes');
const expensesCategoryRoutes = require('./Expenses/expensesCategoryRoutes');
const expensesRoutes = require('./Expenses/expensesRoutes');


// item 

const itemRoutes = require('./Item/itemRoutes');
const itemQuantityRoutes = require('./Item/itemQuantityRoutes');
const itemBrandRoutes = require('./Item/itemBrandRoutes');
const itemCategoryRoutes = require('./Item/itemCategoryRoutes');
const itemUnitRoutes = require('./Item/itemUnitRoutes');
const itemPriceTypeRoutes = require('./Item/itemPriceTypeRoutes');
const itemPriceRoutes = require('./Item/itemPriceRoutes');
const itemTransferRoutes = require('./Item/itemTransferRoutes');
const itemTransactionRoutes = require('./Item/itemTransactionRoutes');


 // Buy Incvoice
const buyInvoiceRoutes = require('./Buy/buyInvoiceRoutes');
const buyItemRoutes = require('./Buy/buyItemRoutes');


// Use the routes with the appropriate prefixes

router.use('/company', companyRoutes);
router.use('/capital', capitalRoutes);
router.use('/branch', branchRoutes);
router.use('/warehouse', warehouseRoutes);
router.use('/city', cityRoutes);
router.use('/zone', zoneRoutes);
router.use('/region', regionRoutes);

//  customer
router.use('/customer', customerRoutes);
router.use('/customer-category', customerCategoryRoutes);

router.use('/payments', customerPaymentRoutes);
 
//  employee
router.use('/user', userRoutes);
router.use('/salary', salaryRoutes);

// expenses
router.use('/expenses-category', expensesCategoryRoutes);
router.use('/expenses', expensesRoutes);

// item routes
router.use('/item', itemRoutes);
router.use('/item-quantity', itemQuantityRoutes);
router.use('/item-brand', itemBrandRoutes);
router.use('/item-category', itemCategoryRoutes);
router.use('/item-unit', itemUnitRoutes);
router.use('/item-price-type', itemPriceTypeRoutes);
router.use('/item-price', itemPriceRoutes);
router.use('/item-transfer', itemTransferRoutes);
router.use('/item-transaction', itemTransactionRoutes);


// Buy
router.use('/buy-invoice', buyInvoiceRoutes);
router.use('/buy-item', buyItemRoutes);

// Export the router to use it in other files
module.exports = router;