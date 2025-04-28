const Customer = require('../../models/Customer/Customer');
const Zone = require('../../models/Zone/Zone');
const City = require('../../models/City/City'); // Assuming you have a City model
const CustomerCategory = require('../../models/Customer/CustomerCategory');
const i18n = require('../../config/i18nConfig');

// Create customer
exports.create = (req, res) => {
  const { category_id, zone_id, code, name, phone_1, phone_2, type, note, city_id, kafyl_name, kafyl_phone, state, address, cobon, limit_loan_price, limit_loan_day, loan, loan_start } = req.body;

  // Validate input
  if (!name) {
    return res.status(400).json({ error: i18n.__('validation.required.customer_name') });
  }
  if (!phone_1) {
    return res.status(400).json({ error: i18n.__('validation.required.phone_1') });
  }
  if (!type) {
    return res.status(400).json({ error: i18n.__('validation.required.customer_type') });
  }
  if (!state) {
    return res.status(400).json({ error: i18n.__('validation.required.customer_state') });
  }
  if (!zone_id) {
    return res.status(400).json({ error: i18n.__('validation.required.zone_id') });
  }
  if (!category_id) {
    return res.status(400).json({ error: i18n.__('validation.required.customer_category_id') });
  }

  // Check if zone_id is valid
  Zone.getById(zone_id, (err, zoneResult) => {
    if (err || zoneResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.zone_id') });
    }

    // Check if category_id is valid
    CustomerCategory.getById(category_id, (err, categoryResult) => {
      if (err || categoryResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.customer_category_id') });
      }

        // Check if city_id is valid
        City.getById(city_id, (err, cityResult) => {
          if (err || cityResult.length === 0) {
            return res.status(400).json({ error: i18n.__('validation.invalid.city_id') });
          }

      // Prepare data for saving
      const customerData = { category_id, zone_id, code, name, phone_1, phone_2, type, note, city_id, kafyl_name, kafyl_phone, state, address, cobon, limit_loan_price, limit_loan_day, loan, loan_start };

      customerData.city_id = customerData.city_id || 0;
      Customer.create(customerData, (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage.includes('phone_1')) {
            return res.status(400).json({ error: i18n.__('validation.unique.phone_1') });
          }
          return res.status(500).json({ error: "Error occurred while creating the customer" });
        }
        res.status(201).json({ message: i18n.__('messages.customer_created'), customer: { id: result.insertId, ...customerData } });
      });
    });
  });
  });
};

// Get all customers
exports.getAll = (req, res) => {
  Customer.getAll((err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_customers') });
    res.status(200).json(result);
  });
};

// Get customer by ID
exports.getById = (req, res) => {
  const { id } = req.params;
  Customer.getById(id, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_customer') });
    if (result.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.customer_not_found') });
    res.status(200).json(result[0]);
  });
};

// Update customer
exports.update = (req, res) => {
  const { id } = req.params;
  const { category_id, zone_id, code, name, phone_1, phone_2, type, note, city_id, kafyl_name, kafyl_phone, state, address, cobon, limit_loan_price, limit_loan_day, loan, loan_start } = req.body;

  // Validate input
  if (!name) {
    return res.status(400).json({ error: i18n.__('validation.required.customer_name') });
  }
  if (!phone_1) {
    return res.status(400).json({ error: i18n.__('validation.required.phone_1') });
  }
  if (!type) {
    return res.status(400).json({ error: i18n.__('validation.required.customer_type') });
  }
  if (!state) {
    return res.status(400).json({ error: i18n.__('validation.required.customer_state') });
  }
  if (!zone_id) {
    return res.status(400).json({ error: i18n.__('validation.required.zone_id') });
  }
  if (!category_id) {
    return res.status(400).json({ error: i18n.__('validation.required.customer_category_id') });
  }

  // Check if zone_id is valid
  Zone.getById(zone_id, (err, zoneResult) => {
    if (err || zoneResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.zone_id') });
    }

    // Check if category_id is valid
    CustomerCategory.getById(category_id, (err, categoryResult) => {
      if (err || categoryResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.customer_category_id') });
      }

      // Prepare data for updating
      const customerData = { category_id, zone_id, code, name, phone_1, phone_2, type, note, city_id, kafyl_name, kafyl_phone, state, address, cobon, limit_loan_price, limit_loan_day, loan, loan_start };

      Customer.update(id, customerData, (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage.includes('phone_1')) {
            return res.status(400).json({ error: i18n.__('validation.unique.phone_1') });
          }
          return res.status(500).json({ error: "Error occurred while creating the customer" });
        }
        res.status(200).json({ message: i18n.__('messages.customer_updated') });
      });
    });
  });
};

// Delete customer
exports.delete = (req, res) => {
  const { id } = req.params;
  Customer.deleteSoft(id, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_customer') });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.customer_not_found') });
    res.status(200).json({ message: i18n.__('messages.customer_deleted') });
  });
};

// Increase loan
exports.increaseLoan = (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: i18n.__('validation.invalid.amount') });
  }

  Customer.increaseLoan(id, amount, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_increasing_loan') });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.customer_not_found') });
    res.status(200).json({ message: i18n.__('messages.loan_increased') });
  });
};

// Decrease loan
exports.decreaseLoan = (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: i18n.__('validation.invalid.amount') });
  }

  Customer.decreaseLoan(id, amount, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_decreasing_loan') });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.customer_not_found') });
    res.status(200).json({ message: i18n.__('messages.loan_decreased') });
  });
};