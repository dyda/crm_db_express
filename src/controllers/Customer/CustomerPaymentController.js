const CustomerPayment = require('../../models/Customer/CustomerPayment');
const Customer = require('../../models/Customer/Customer'); // Ensure this is correctly imported
const Currency = require('../../models/Currency/Currency');
const Branch = require('../../models/Branch/Branch'); // Ensure this is correctly imported
const { convertToBaseCurrency } = require('../../components/helpers');
const { convertToBaseCurrencyWithRate } = require('../../components/helpers');
const { getBaseCurrency } = require('../../components/helpers');
const i18n = require('../../config/i18nConfig');
// Helper to get currency by id using the model
function getCurrencyById(id) {
  return new Promise((resolve, reject) => {
    Currency.getById(id, (err, result) => {
      if (err || !result || result.length === 0) return resolve(null);
      resolve(result[0]);
    });
  });
}


// Create Payment
exports.createPayment = (req, res) => {
  const paymentData = req.body;

  // Validate required fields
  if (!paymentData.customer_id) {
    return res.status(400).json({ error: i18n.__('validation.required.customer_id') });
  }
  if (!paymentData.type) {
    return res.status(400).json({ error: i18n.__('validation.required.type') });
  }
  if (!paymentData.amount) {
    return res.status(400).json({ error: i18n.__('validation.required.amount') });
  }
  if (!paymentData.branch_id) {
    return res.status(400).json({ error: i18n.__('validation.required.branch_id') });
  }
  if (!paymentData.currency_id) {
    return res.status(400).json({ error: i18n.__('validation.required.currency_id') });
  }

  Branch.getById(paymentData.branch_id, (err, branchResult) => {
    if (err || branchResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.branch_id') });
    }

    Customer.getById(paymentData.customer_id, async (err, customerResult) => {
      if (err || customerResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.customer_id') });
      }

      const customer = customerResult[0];
      const currentLoan = Number(customer.loan) || 0;
      const customerCurrencyId = customer.currency_id;

      

      // Fetch all currencies
      const paymentCurrency = await getCurrencyById(paymentData.currency_id);
      const customerCurrency = await getCurrencyById(customerCurrencyId);
      const baseCurrency = await getBaseCurrency();

      if (!paymentCurrency || !customerCurrency || !baseCurrency) {
        return res.status(400).json({ error: i18n.__('validation.invalid.currency_id') });
      }

      // --- 1. Convert amount/discount for customer loan (customer currency) ---
      let amountInCustomerCurrency = Number(paymentData.amount);
      let discountInCustomerCurrency = Number(paymentData.discount_result || 0);

      // Defensive check
        if (
          !paymentCurrency.exchange_rate || paymentCurrency.exchange_rate <= 0 ||
          !customerCurrency.exchange_rate || customerCurrency.exchange_rate <= 0
        ) {
          return res.status(400).json({ error: "Invalid exchange rate for currency conversion." });
        }


    if (paymentData.currency_id !== customerCurrencyId) {
      // Convert payment amount and discount to customer currency
      amountInCustomerCurrency = Number(paymentData.amount) * (customerCurrency.exchange_rate / paymentCurrency.exchange_rate);
      discountInCustomerCurrency = Number(paymentData.discount_result || 0) * (paymentCurrency.exchange_rate / customerCurrency.exchange_rate);
    }

      // --- 2. Calculate result in customer currency ---
      const result = currentLoan - amountInCustomerCurrency - discountInCustomerCurrency;
      paymentData.result = result;
     
      // --- Set loan for the payment record (required for DB, cannot be null) ---
      paymentData.loan = result; // or use currentLoan if you want the loan before payment


      // --- 3. Calculate amountInBase for branch wallet (base currency) ---
      let amountInBase = Number(paymentData.amount);
      if (paymentData.currency_id !== baseCurrency.id) {
        amountInBase = Number(paymentData.amount) * (baseCurrency.exchange_rate / paymentCurrency.exchange_rate);
      }

      // --- 4. Set exchange_rate for record keeping ---
      paymentData.exchange_rate = paymentCurrency.exchange_rate;
      paymentData.payment_date = paymentData.payment_date || new Date().toISOString().slice(0, 10);
      paymentData.created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

      // --- 5. Validations ---
      if (paymentData.discount_result && Number(paymentData.discount_result) < 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.discount_result') });
      }
      if (
        paymentData.discount_type === 'پارە' &&
        Math.abs(Number(paymentData.discount_result)) > Math.abs(Number(currentLoan))
      ) {
        return res.status(400).json({ error: i18n.__('validation.discount_more_than_loan') });
      }
      if (
        paymentData.discount_type === 'ڕێژە' &&
        Number(paymentData.discount_value) > 100
      ) {
        return res.status(400).json({ error: i18n.__('validation.discount_percent_too_high') });
      }

      // --- 6. Create Payment and update loan/wallet ---
      CustomerPayment.create(paymentData, (err, result) => {

        if (err) {
          console.error('CustomerPayment.create error:', err, paymentData);
          return res.status(500).json({ error: i18n.__('messages.error_creating_payment'), details: err.message || err });
        }

        const totalForLoan = amountInCustomerCurrency + discountInCustomerCurrency;
        if (!isFinite(totalForLoan)) {
          console.error('Currency conversion error:', {
            amountInCustomerCurrency,
            discountInCustomerCurrency,
            totalForLoan,
            paymentCurrency,
            customerCurrency,
            paymentData
          });
          return res.status(400).json({ error: "Currency conversion error: invalid value for loan update" });
        }
    

        if (paymentData.type === i18n.__('payment_type.payment')) {
          // Decrease wallet (base currency), increase customer loan (customer currency)
          Branch.decreaseWallet(paymentData.branch_id, amountInBase, (err) => {
            if (err) return res.status(500).json({ error: i18n.__('messages.error_decreasing_wallet') });

             if (err) return res.status(500).json({ error: i18n.__('messages.error_decreasing_wallet') });
            Customer.increaseLoan(paymentData.customer_id, totalForLoan, (err) => {
              if (err) return res.status(500).json({ error: i18n.__('messages.error_increasing_loan') });
              res.status(201).json({ message: i18n.__('messages.payment_created') });
            });
          });
        } else if (paymentData.type === i18n.__('payment_type.receipt')) {
          // Increase wallet (base currency), decrease customer loan (customer currency)
          Branch.increaseWallet(paymentData.branch_id, amountInBase, (err) => {
            if (err) return res.status(500).json({ error: i18n.__('messages.error_increasing_wallet') });
            Customer.decreaseLoan(paymentData.customer_id, totalForLoan, (err) => {
              if (err) return res.status(500).json({ error: i18n.__('messages.error_increasing_loan') });
              res.status(201).json({ message: i18n.__('messages.payment_created') });
            });
          });
          } else {
          res.status(201).json({ message: i18n.__('messages.payment_created') });
        }
      });
    });
  });
};


// Get All Payments
exports.getAllPayments = (req, res) => {
  CustomerPayment.getAll((err, results) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_payments') });
    res.status(200).json(results);
  });
};

// Filter Payments (with date range required)
exports.filterPayments = (req, res) => {
  const {
    startDate,
    endDate,
    customer_id,
    employee_id,
    branch_id,
    currency_id,
    payment_method,
    type,
    reference_number,
    user_id,
    sortBy,
    sortOrder,
    page,
    pageSize
  } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: i18n.__('validation.required.date_range') });
  }

  const filters = {
    startDate,
    endDate,
    customer_id,
    employee_id,
    branch_id,
    currency_id,
    payment_method,
    type,
    reference_number,
    user_id,
    sortBy,
    sortOrder,
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined
  };

  CustomerPayment.filter(filters, (err, results) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_payments') });
    res.status(200).json(results);
  });
};

// Get Payment by ID
exports.getPaymentById = (req, res) => {
  const paymentId = req.params.id;
  CustomerPayment.getById(paymentId, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_payment') });
    if (result.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.payment_not_found') });
    res.status(200).json(result[0]);
  });
};


// Update Payment
exports.updatePayment = (req, res) => {
  const paymentId = req.params.id;
  const paymentData = req.body;

  // Validate required fields (add your validation here as needed)

  Branch.getById(paymentData.branch_id, (err, branchResult) => {
    if (err || branchResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.branch_id') });
    }

    Customer.getById(paymentData.customer_id, (err, customerResult) => {
      if (err || customerResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.customer_id') });
      }

      // Prevent negative or illogical discount_result
      if (paymentData.discount_result && Number(paymentData.discount_result) < 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.discount_result') });
      }

      // Prevent fixed discount > loan
      if (
        paymentData.discount_type === 'پارە' &&
        Math.abs(Number(paymentData.discount_result)) > Math.abs(currentLoan)
      ) {
        return res.status(400).json({ error: i18n.__('validation.discount_more_than_loan') });
      }

      // Prevent percent discount > 100
      if (
        paymentData.discount_type === 'ڕێژە' &&
        Number(paymentData.discount_value) > 100
      ) {
        return res.status(400).json({ error: i18n.__('validation.discount_percent_too_high') });
      }




      CustomerPayment.getById(paymentId, async (err, existingPayment) => {
        if (err) return res.status(500).json({ error: err.message });
        if (existingPayment.length === 0) return res.status(404).json({ error: 'هیچ زانیارییەک نەدۆزرایەوە' });

        const oldPayment = existingPayment[0];
        const oldResult = Number(oldPayment.result);
        const oldType = oldPayment.type;
        const oldExchangeRate = Number(oldPayment.exchange_rate);
        const oldAmountInBase = convertToBaseCurrencyWithRate(oldResult, oldExchangeRate);

        // Calculate new result and exchange rate
        paymentData.result = typeof paymentData.result !== 'undefined'
          ? Number(paymentData.result)
          : Number(paymentData.amount) - Number(paymentData.discount_result || 0);

        let newAmountInBase = oldAmountInBase;
        let newExchangeRate = oldExchangeRate;

        // Only recalculate if result or currency_id changed
        if (
          paymentData.result !== oldResult ||
          paymentData.currency_id !== oldPayment.currency_id
        ) {
          try {
            const { amountInBase, exchange_rate } = await convertToBaseCurrency(paymentData.result, paymentData.currency_id);
            if (!exchange_rate || exchange_rate === 0) {
              return res.status(400).json({ error: i18n.__('messages.exchange_rate_zero') });
            }
            paymentData.exchange_rate = parseFloat(exchange_rate);
            newAmountInBase = amountInBase;
            newExchangeRate = parseFloat(exchange_rate);
          } catch (err) {
            return res.status(400).json({ error: i18n.__('messages.currency_conversion_failed', { error: err }) });
          }
        } else {
          paymentData.exchange_rate = oldExchangeRate;
        }
        paymentData.payment_date = paymentData.payment_date || paymentData.created_at || new Date().toISOString().slice(0, 10);

        
        // Update the payment details
        CustomerPayment.update(paymentId, paymentData, (err, result) => {
          if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_payment') });
          if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.payment_not_found') });

          // Reverse old effect using oldAmountInBase, then apply new effect using newAmountInBase
          const processUpdate = async () => {
            if (oldType === i18n.__('payment_type.payment')) {
              // Reverse old
              await new Promise((resolve, reject) => Customer.decreaseLoan(oldPayment.customer_id, oldResult, err => err ? reject(err) : resolve()));
              await new Promise((resolve, reject) => Branch.increaseWallet(oldPayment.branch_id, oldAmountInBase, err => err ? reject(err) : resolve()));
            } else if (oldType === i18n.__('payment_type.receipt')) {
              await new Promise((resolve, reject) => Customer.increaseLoan(oldPayment.customer_id, oldResult, err => err ? reject(err) : resolve()));
              await new Promise((resolve, reject) => Branch.decreaseWallet(oldPayment.branch_id, oldAmountInBase, err => err ? reject(err) : resolve()));
            }
            // Apply new
            if (paymentData.type === i18n.__('payment_type.payment')) {
              await new Promise((resolve, reject) => Customer.increaseLoan(paymentData.customer_id, paymentData.result, err => err ? reject(err) : resolve()));
              await new Promise((resolve, reject) => Branch.decreaseWallet(paymentData.branch_id, newAmountInBase, err => err ? reject(err) : resolve()));
            } else if (paymentData.type === i18n.__('payment_type.receipt')) {
              await new Promise((resolve, reject) => Customer.decreaseLoan(paymentData.customer_id, paymentData.result, err => err ? reject(err) : resolve()));
              await new Promise((resolve, reject) => Branch.increaseWallet(paymentData.branch_id, newAmountInBase, err => err ? reject(err) : resolve()));
            }
          };

          processUpdate()
            .then(() => res.status(200).json({ message: i18n.__('messages.payment_updated') }))
            .catch(err => res.status(500).json({ error: err.message }));
        });
      });
    });
  });
};

// Delete Payment
exports.deletePayment = (req, res) => {
  const paymentId = req.params.id;
  CustomerPayment.getById(paymentId, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_payment') });
    if (!result || result.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.payment_not_found') });

    const paymentData = result[0];
    const resultValue = Number(paymentData.result);
    const amountInBase = convertToBaseCurrencyWithRate(resultValue, Number(paymentData.exchange_rate));

    CustomerPayment.deleteSoft(paymentId, (err, deleteResult) => {
      if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_payment') });

      // Reverse the effect using the original exchange rate
      if (paymentData.type === i18n.__('payment_type.payment')) {
        Customer.decreaseLoan(paymentData.customer_id, resultValue, (err) => {
          if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_payment') });
          Branch.increaseWallet(paymentData.branch_id, amountInBase, (err) => {
            if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_payment') });
            res.status(200).json({ message: i18n.__('messages.payment_deleted') });
          });
        });
      } else if (paymentData.type === i18n.__('payment_type.receipt')) {
        Customer.increaseLoan(paymentData.customer_id, resultValue, (err) => {
          if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_payment') });
          Branch.decreaseWallet(paymentData.branch_id, amountInBase, (err) => {
            if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_payment') });
            res.status(200).json({ message: i18n.__('messages.payment_deleted') });
          });
        });
      } else {
        res.status(200).json({ message: i18n.__('messages.payment_deleted') });
      }
    });
  });
};
