const CustomerPayment = require('../../models/Customer/CustomerPayment');
const Customer = require('../../models/Customer/Customer'); // Ensure this is correctly imported
const Branch = require('../../models/Branch/Branch'); // Ensure this is correctly imported
const i18n = require('../../config/i18nConfig');
const { convertToBaseCurrency } = require('../../components/helpers');
const { convertToBaseCurrencyWithRate } = require('../../components/helpers');


// Create Payment
exports.createPayment = (req, res) => {
  const paymentData = req.body;

  // Validate required fields (as before)
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
      paymentData.loan = currentLoan;
      paymentData.result = typeof paymentData.result !== 'undefined'
      ? Number(paymentData.result)
      : Number(currentLoan) - Number(paymentData.amount) - Number(paymentData.discount_result || 0);


      try {
        // Always convert the result (final value after discount) to base currency
        const { amountInBase, exchange_rate } = await convertToBaseCurrency(paymentData.result, paymentData.currency_id);

        if (!exchange_rate || exchange_rate === 0) {
          return res.status(400).json({ error: i18n.__('messages.exchange_rate_zero') });
        }

        paymentData.exchange_rate = parseFloat(exchange_rate);
        paymentData.payment_date = paymentData.payment_date || paymentData.created_at || new Date().toISOString().slice(0, 10);
        paymentData.loan = currentLoan;

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


        CustomerPayment.create(paymentData, (err, result) => {
          if (err) return res.status(500).json({ error: i18n.__('messages.error_creating_payment') });

          // Use amountInBase for wallet/loan operations
          if (paymentData.type === i18n.__('payment_type.payment')) {
            Customer.increaseLoan(paymentData.customer_id, paymentData.result, (err) => {
              if (err) return res.status(500).json({ error: i18n.__('messages.error_increasing_loan') });
              Branch.decreaseWallet(paymentData.branch_id, amountInBase, (err) => {
                if (err) return res.status(500).json({ error: i18n.__('messages.error_decreasing_wallet') });
                res.status(201).json({ message: i18n.__('messages.payment_created') });
              });
            });
          } else if (paymentData.type === i18n.__('payment_type.receipt')) {
            Customer.decreaseLoan(paymentData.customer_id, paymentData.result, (err) => {
              if (err) return res.status(500).json({ error: err.message });
              Branch.increaseWallet(paymentData.branch_id, amountInBase, (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ message: i18n.__('messages.payment_created') });
              });
            });
          } else {
            res.status(201).json({ message: i18n.__('messages.payment_created') });
          }
        });
      } catch (err) {
        return res.status(400).json({ error: i18n.__('messages.currency_conversion_failed', { error: err }) });
      }
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
