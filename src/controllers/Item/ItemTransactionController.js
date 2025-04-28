const ItemTransaction = require('../../models/Item/ItemTransaction');
const ItemQuantity = require('../../models/Item/ItemQuantity');
const Warehouse = require('../../models/Warehouse/Warehouse');
const Employee = require('../../models/User/User');
const Item = require('../../models/Item/Item');
const i18n = require('../../config/i18nConfig'); // Import i18n for localization

// Helper function to validate required fields
const validateRequiredFields = (fields) => {
  const { type, warehouse_id, item_id, quantity, employee_id } = fields;
  if (!type) {
    return i18n.__('validation.required.transaction_type');
  }
  if (!warehouse_id) {
    return i18n.__('validation.required.warehouse_id');
  }
  if (!item_id) {
    return i18n.__('validation.required.item_id');
  }
  if (!quantity) {
    return i18n.__('validation.required.quantity');
  }
  if (!employee_id) {
    return i18n.__('validation.required.employee_id');
  }
  return null;
};

// Create Item Transaction
exports.createTransaction = (req, res) => {
  const { type, warehouse_id, item_id, quantity, employee_id, note } = req.body;

  // Validate required fields
  const validationError = validateRequiredFields(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  // Check if item_id, warehouse_id, and employee_id are valid
  Item.getById(item_id, (err, itemResult) => {
    if (err || itemResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.item_id') });
    }

    Warehouse.getById(warehouse_id, (err, warehouseResult) => {
      if (err || warehouseResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.warehouse_id') });
      }

      Employee.getById(employee_id, (err, employeeResult) => {
        if (err || employeeResult.length === 0) {
          return res.status(400).json({ error: i18n.__('validation.invalid.employee_id') });
        }

        // Adjust item quantity based on the type
        if (type === '+') {
          ItemQuantity.increaseQuantity(warehouse_id, item_id, quantity, (err, updateResult) => {
            if (err) return res.status(500).json({ error: i18n.__('messages.error_increasing_item_quantity') });

            // Create item transaction record
            const transactionData = { type, warehouse_id, item_id, quantity, employee_id, note };
            ItemTransaction.create(transactionData, (err, result) => {
              if (err) return res.status(500).json({ error: i18n.__('messages.error_creating_transaction') });
              res.status(201).json({ message: i18n.__('messages.transaction_created'), id: result.insertId });
            });
          });
        } else if (type === '-') {
          ItemQuantity.decreaseQuantity(warehouse_id, item_id, quantity, (err, updateResult) => {
            if (err) return res.status(500).json({ error: i18n.__('messages.error_decreasing_item_quantity') });

            // Create item transaction record
            const transactionData = { type, warehouse_id, item_id, quantity, employee_id, note };
            ItemTransaction.create(transactionData, (err, result) => {
              if (err) return res.status(500).json({ error: i18n.__('messages.error_creating_transaction') });
              res.status(201).json({ message: i18n.__('messages.transaction_created'), id: result.insertId });
            });
          });
        } else {
          return res.status(400).json({ error: i18n.__('validation.invalid.transaction_type') });
        }
      });
    });
  });
};

// Get All Item Transactions
exports.getAllTransactions = (req, res) => {
  ItemTransaction.getAll((err, results) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_transactions') });
    res.status(200).json(results);
  });
};

// Get Item Transaction by ID
exports.getTransactionById = (req, res) => {
  const { id } = req.params;
  ItemTransaction.getById(id, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_transaction') });
    if (result.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.transaction_not_found') });
    res.status(200).json(result[0]);
  });
};

// Get Item Transactions by Filters
exports.getTransactionsByFilters = (req, res) => {
  const filters = req.body;

  // Validate filters
  if (!filters.startDate || !filters.endDate) {
    return res.status(400).json({ error: i18n.__('validation.required.date_range') });
  }

  ItemTransaction.getByFilters(filters, (err, results) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_transactions') });
    if (results.length === 0) {
      return res.status(404).json({ message: i18n.__('messages.no_transactions_found') });
    }
    res.status(200).json({
      message: i18n.__('messages.transactions_found', { count: results.length }),
      transactions: results
    });
  });
};


// Update Item Transaction
exports.updateTransaction = (req, res) => {
    const { id } = req.params;
    const { type, warehouse_id, item_id, quantity, employee_id, note } = req.body;
  
    // Validate required fields
    const validationError = validateRequiredFields(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
  
    // Get the existing item transaction details
  ItemTransaction.getById(id, (err, existingTransaction) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_transaction') });
    if (existingTransaction.length === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.transaction_not_found') });
    }
      const oldTransaction = existingTransaction[0];
      const oldQuantity = parseFloat(oldTransaction.quantity);
      const oldType = oldTransaction.type;
      const newQuantity = parseFloat(quantity);
      const quantityDifference = newQuantity - oldQuantity;

      // Adjust item quantity based on the type and difference
      const adjustQuantity = (callback) => {
        if (oldType === '+' && type === '+') {
          ItemQuantity.increaseQuantity(warehouse_id, item_id, quantityDifference, callback);
        } else if (oldType === '-' && type === '-') {
          ItemQuantity.decreaseQuantity(warehouse_id, item_id, quantityDifference, callback);
        } else if (oldType === '+' && type === '-') {
         
          ItemQuantity.decreaseQuantity(warehouse_id, item_id, oldQuantity + newQuantity, callback);
        } else if (oldType === '-' && type === '+') {

          
          ItemQuantity.increaseQuantity(warehouse_id, item_id, oldQuantity + newQuantity, callback);
        } else {
          return res.status(400).json({ error: i18n.__('validation.invalid.transaction_type') });
        }
      };
  
      adjustQuantity((err, updateResult) => {
        if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_transaction') });
  
        // Update item transaction record
        const transactionData = { type, warehouse_id, item_id, quantity, employee_id, note };
        ItemTransaction.update(id, transactionData, (err, result) => {
          if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_transaction') });
          res.status(200).json({ message: i18n.__('messages.transaction_updated') });
        });
      });
    });
  };

// Delete Item Transaction
exports.deleteTransaction = (req, res) => {
  const { id } = req.params;

  // Get the existing item transaction details
  ItemTransaction.getById(id, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_transaction') });
    if (result.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.transaction_not_found') });

    const transactionData = result[0];

    // Soft delete the item transaction
    ItemTransaction.deleteSoft(id, (err, deleteResult) => {
      if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_transaction') });
      if (deleteResult.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.transaction_not_found') });

      // Adjust item quantity based on the type
      if (transactionData.type === '+') {
        ItemQuantity.decreaseQuantity(transactionData.warehouse_id, transactionData.item_id, transactionData.quantity, (err, updateResult) => {
          if (err) return res.status(500).json({ error: i18n.__('messages.error_decreasing_item_quantity') });
          res.status(200).json({ message: i18n.__('messages.transaction_deleted') });
        });
      } else if (transactionData.type === '-') {
        ItemQuantity.increaseQuantity(transactionData.warehouse_id, transactionData.item_id, transactionData.quantity, (err, updateResult) => {
          if (err) return res.status(500).json({ error: i18n.__('messages.error_increasing_item_quantity') });
          res.status(200).json({ message: i18n.__('messages.transaction_deleted') });
        });
      } else {
        return res.status(400).json({ error: i18n.__('validation.invalid.transaction_type') });
      }
    });
  });
};