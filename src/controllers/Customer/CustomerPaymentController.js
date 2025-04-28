const CustomerPayment = require('../../models/Customer/CustomerPayment');
const Customer = require('../../models/Customer/Customer'); // Ensure this is correctly imported
const Branch = require('../../models/Branch/Branch'); // Ensure this is correctly imported
const i18n = require('../../config/i18nConfig');

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
  if (!paymentData.employee_id) {
    return res.status(400).json({ error: i18n.__('validation.required.employee_id') });
  }

    // Check if branch_id is valid
  Branch.getById(paymentData.branch_id, (err, branchResult) => {
    if (err || branchResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.branch_id') });
    }

    // Check if customer_id is valid
    Customer.getById(paymentData.customer_id, (err, customerResult) => {
      if (err || customerResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.customer_id') });
      }

    CustomerPayment.create(paymentData, (err, result) => {
      if (err) return res.status(500).json({ error: i18n.__('messages.error_creating_payment') });
  
      if (paymentData.type === i18n.__('payment_type.payment')) {
        Customer.increaseLoan(paymentData.customer_id, paymentData.result, (err, updateResult) => {
          if (err) return res.status(500).json({ error: i18n.__('messages.error_increasing_loan') });
          Branch.decreaseWallet(paymentData.branch_id, paymentData.result, (err, updateResult) => {
            if (err) return res.status(500).json({ error: i18n.__('messages.error_decreasing_wallet') });
            res.status(201).json({ message: i18n.__('messages.payment_created') });
          });
        });
      } else if (paymentData.type === i18n.__('payment_type.receipt')) {
        Customer.decreaseLoan(paymentData.customer_id, paymentData.result, (err, updateResult) => {
          if (err) return res.status(500).json({ error: err.message });
          Branch.increaseWallet(paymentData.branch_id, paymentData.result, (err, updateResult) => {
            if (err) return res.status(500).json({ error: err.message });
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

// Get Payment by ID
exports.getPaymentById = (req, res) => {
  const paymentId = req.params.id;
  CustomerPayment.findById(paymentId, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_payment') });
    if (result.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.payment_not_found') });
    res.status(200).json(result[0]);
  });
};

// Get Payments by Date Range
exports.getPaymentsByDateRange = (req, res) => {

  const { startDate, endDate, customer_id } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ error: i18n.__('validation.required.date_range') });
  }
  CustomerPayment.getByDateRange(startDate, endDate, customer_id, (err, results) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_payments') });
    if (results.length === 0) {
      return res.status(404).json({ message: i18n.__('messages.no_payments_found') });
    }
    res.status(200).json({ message: i18n.__('messages.payments_found', { count: results.length }), payments: results });
  });
};

// Update Payment
exports.updatePayment = (req, res) => {
  const paymentId = req.params.id;
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
  if (!paymentData.employee_id) {
    return res.status(400).json({ error: i18n.__('validation.required.employee_id') });
  }

   // Check if branch_id is valid
   Branch.getById(paymentData.branch_id, (err, branchResult) => {
    if (err || branchResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.branch_id') });
    }

    
    // Check if customer_id is valid
    Customer.getById(customer_id, (err, customerResult) => {
      if (err || customerResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.customer_id') });
      }

  // Retrieve the existing payment details
  CustomerPayment.findById(paymentId, (err, existingPayment) => {
    if (err) return res.status(500).json({ error: err.message });
    if (existingPayment.length === 0) return res.status(404).json({ error: 'هیچ زانیارییەک نەدۆزرایەوە' });

    const oldPayment = existingPayment[0];
    const oldResult = oldPayment.result;
    const oldType = oldPayment.type;
    const newResult = paymentData.result;
    const resultDifference = newResult - oldResult;

    // Update the payment details
    CustomerPayment.update(paymentId, paymentData, (err, result) => {
      if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_payment') });
      if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.payment_not_found') });

      // Adjust the customer's loan and Branch wallet based on the old and new types and amounts
      if (oldType === i18n.__('payment_type.payment') && paymentData.type === i18n.__('payment_type.payment')) {
        Customer.increaseLoan(paymentData.customer_id, resultDifference, (err, updateResult) => {
          if (err) return res.status(500).json({ error: err.message });
          Branch.decreaseWallet(paymentData.branch_id, resultDifference, (err, updateResult) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: i18n.__('messages.payment_updated') });
          });
        });
      } else if (oldType === i18n.__('payment_type.receipt') && paymentData.type === i18n.__('payment_type.receipt')) {
        Customer.decreaseLoan(paymentData.customer_id, resultDifference, (err, updateResult) => {
          if (err) return res.status(500).json({ error: err.message });
          Branch.increaseWallet(paymentData.branch_id, resultDifference, (err, updateResult) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: i18n.__('messages.payment_updated') });
          });
        });
      } else if (oldType === i18n.__('payment_type.payment') && paymentData.type === i18n.__('payment_type.receipt')) {
        Customer.decreaseLoan(paymentData.customer_id, oldResult, (err, updateResult) => {
          if (err) return res.status(500).json({ error: err.message });
          Customer.decreaseLoan(paymentData.customer_id, newResult, (err, updateResult) => {
            if (err) return res.status(500).json({ error: err.message });
            Branch.increaseWallet(paymentData.branch_id, oldResult, (err, updateResult) => {
              if (err) return res.status(500).json({ error: err.message });
              Branch.increaseWallet(paymentData.branch_id, newResult, (err, updateResult) => {
                if (err) return res.status(500).json({ error: err.message });
                res.status(200).json({ message: i18n.__('messages.payment_updated') });
              });
            });
          });
        });
      } else if (oldType === i18n.__('payment_type.receipt') && paymentData.type === i18n.__('payment_type.payment')) {
        Customer.increaseLoan(paymentData.customer_id, oldResult, (err, updateResult) => {
          if (err) return res.status(500).json({ error: err.message });
          Customer.increaseLoan(paymentData.customer_id, newResult, (err, updateResult) => {
            if (err) return res.status(500).json({ error: err.message });
            Branch.decreaseWallet(paymentData.branch_id, oldResult, (err, updateResult) => {
              if (err) return res.status(500).json({ error: err.message });
              Branch.decreaseWallet(paymentData.branch_id, newResult, (err, updateResult) => {
                if (err) return res.status(500).json({ error: err.message });
                res.status(200).json({ message: i18n.__('messages.payment_updated') });
              });
            });
          });
        });
      } else {
        res.status(200).json({ message: i18n.__('messages.payment_updated') });
      }
    });
  });
});
});

};

// Delete Payment
exports.deletePayment = (req, res) => {
  const paymentId = req.params.id;
  CustomerPayment.findById(paymentId, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_payment') });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.payment_not_found') });

    const paymentData = result[0];

    CustomerPayment.deleteSoft(paymentId, (err, deleteResult) => {
      if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_payment') });
      if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.payment_not_found') });

      if (paymentData.type === i18n.__('payment_type.payment')) {
        Customer.decreaseLoan(paymentData.customer_id, paymentData.result, (err, updateResult) => {
          if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_payment') });
          Branch.increaseWallet(paymentData.branch_id, paymentData.result, (err, updateResult) => {
            if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_payment') });
            res.status(200).json({ message: i18n.__('messages.payment_deleted') });
          });
        });
      } else if (paymentData.type === i18n.__('payment_type.receipt')) {
        Customer.increaseLoan(paymentData.customer_id, paymentData.result, (err, updateResult) => {
          if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_payment') });
          Branch.decreaseWallet(paymentData.branch_id, paymentData.result, (err, updateResult) => {
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
