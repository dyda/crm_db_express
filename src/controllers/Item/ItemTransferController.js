const ItemTransfer = require('../../models/Item/ItemTransfer');
const ItemQuantity = require('../../models/Item/ItemQuantity');
const i18n = require('../../config/i18nConfig'); // Import i18n for localization

// Create Item Transfer
exports.createTransfer = (req, res) => {
  const { item_id, from_warehouse_id, to_warehouse_id, quantity, employee_id, note } = req.body;

  
  // Validate required fields
  if (!item_id) {
    return res.status(400).json({ error: i18n.__('validation.required.item_id') });
  }
  if (!from_warehouse_id) {
    return res.status(400).json({ error: i18n.__('validation.required.from_warehouse_id') });
  }
  if (!to_warehouse_id) {
    return res.status(400).json({ error: i18n.__('validation.required.to_warehouse_id') });
  }
  if (!quantity) {
    return res.status(400).json({ error: i18n.__('validation.required.quantity') });
  }
  if (!employee_id) {
    return res.status(400).json({ error: i18n.__('validation.required.employee_id') });
  }

  // Check if item quantity is available in from_warehouse_id
  ItemQuantity.getByWarehouseAndItem(from_warehouse_id, item_id, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_item_quantity') });
    if (result.length === 0 || result[0].quantity < quantity) {
      return res.status(400).json({ error: i18n.__('validation.invalid.insufficient_quantity') });
    }

    // Decrease item quantity from from_warehouse_id
    ItemQuantity.decreaseQuantity(from_warehouse_id, item_id, quantity, (err, updateResult) => {
      if (err) return res.status(500).json({ error: i18n.__('messages.error_decreasing_item_quantity') });

      // Increase item quantity in to_warehouse_id
      ItemQuantity.increaseQuantity(to_warehouse_id, item_id, quantity, (err, updateResult) => {
        if (err) return res.status(500).json({ error: i18n.__('messages.error_increasing_item_quantity') });

        // Create item transfer record
        const transferData = { item_id, from_warehouse_id, to_warehouse_id, quantity, employee_id, note };
        ItemTransfer.create(transferData, (err, result) => {
          if (err) return res.status(500).json({ error: i18n.__('messages.error_creating_transfer') });
          res.status(201).json({ message: i18n.__('messages.transfer_created'), id: result.insertId });
        });
      });
    });
  });
};

// Get All Item Transfers
exports.getAllTransfers = (req, res) => {
  ItemTransfer.getAll((err, results) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_transfers') });
    res.status(200).json(results);
  });
};

// Get Item Transfer by ID
exports.getTransferById = (req, res) => {
  const { id } = req.params;
  ItemTransfer.getById(id, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_transfer') });
    if (result.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.transfer_not_found') });
    res.status(200).json(result[0]);
  });
};

// Get Item Transfers by Filters
exports.getTransfersByFilters = (req, res) => {
  const filters = req.body;

  ItemTransfer.getByFilters(filters, (err, results) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_transfers') });
    if (results.length === 0) {
      return res.status(404).json({ message: i18n.__('messages.no_transfers_found') });
    }
    res.status(200).json({
      message: i18n.__('messages.transfers_found', { count: results.length }),
      transfers: results
    });
  });
};

// Update Item Transfer
exports.updateTransfer = (req, res) => {
    const { id } = req.params;
    const { item_id, from_warehouse_id, to_warehouse_id, quantity, employee_id, note } = req.body;
  
      // Validate required fields
  if (!item_id) {
    return res.status(400).json({ error: i18n.__('validation.required.item_id') });
  }
  if (!from_warehouse_id) {
    return res.status(400).json({ error: i18n.__('validation.required.from_warehouse_id') });
  }
  if (!to_warehouse_id) {
    return res.status(400).json({ error: i18n.__('validation.required.to_warehouse_id') });
  }
  if (!quantity) {
    return res.status(400).json({ error: i18n.__('validation.required.quantity') });
  }
  if (!employee_id) {
    return res.status(400).json({ error: i18n.__('validation.required.employee_id') });
  }
  
    // Get the existing item transfer details
    ItemTransfer.getById(id, (err, existingTransfer) => {
      if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_transfer') });
      if (existingTransfer.length === 0) {
        return res.status(404).json({ error: i18n.__('validation.invalid.transfer_not_found') });
      }  
      const oldTransfer = existingTransfer[0];
      const oldQuantity = oldTransfer.quantity;
      const quantityDifference = quantity - oldQuantity;
  
      // Prepare data for updating
      const transferData = { item_id, from_warehouse_id, to_warehouse_id, quantity, employee_id, note };
  
      // Update the item transfer
      ItemTransfer.update(id, transferData, (err, result) => {
        if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_transfer') });
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: i18n.__('validation.invalid.transfer_not_found') });
        }
        // Adjust item quantities based on the difference
        if (quantityDifference !== 0) {
          // If the quantity has increased, decrease the difference from the from_warehouse_id and increase it in the to_warehouse_id
          if (quantityDifference > 0) {
            ItemQuantity.decreaseQuantity(from_warehouse_id, item_id, quantityDifference, (err, updateResult) => {
              if (err) return res.status(500).json({ error: i18n.__('messages.error_decreasing_item_quantity') });
  
              ItemQuantity.increaseQuantity(to_warehouse_id, item_id, quantityDifference, (err, updateResult) => {
                if (err) return res.status(500).json({ error: i18n.__('messages.error_increasing_item_quantity') });
                res.status(200).json({ message: i18n.__('messages.transfer_updated') });
              });
            });
          } else {
            // If the quantity has decreased, increase the difference in the from_warehouse_id and decrease it in the to_warehouse_id
            const positiveDifference = Math.abs(quantityDifference);
            ItemQuantity.increaseQuantity(from_warehouse_id, item_id, positiveDifference, (err, updateResult) => {
              if (err) return res.status(500).json({ error: i18n.__('messages.error_increasing_item_quantity') });
  
              ItemQuantity.decreaseQuantity(to_warehouse_id, item_id, positiveDifference, (err, updateResult) => {
                if (err) return res.status(500).json({ error: i18n.__('messages.error_decreasing_item_quantity') });
                res.status(200).json({ message: i18n.__('messages.transfer_updated') });
              });
            });
          }
        } else {
          res.status(200).json({ message: i18n.__('messages.transfer_updated') });
        }
      });
    });
  };

// Delete Item Transfer
exports.deleteTransfer = (req, res) => {
    const { id } = req.params;
  
    // Get the existing item transfer details
    ItemTransfer.getById(id, (err, result) => {
      if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_transfer') });
      if (result.length === 0) {
        return res.status(404).json({ error: i18n.__('validation.invalid.transfer_not_found') });
      }
      const transferData = result[0];
  
      // Soft delete the item transfer
      ItemTransfer.deleteSoft(id, (err, deleteResult) => {
        if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_transfer') });
        if (deleteResult.affectedRows === 0) {
          return res.status(404).json({ error: i18n.__('validation.invalid.transfer_not_found') });
        }  
        // Increase item quantity in from_warehouse_id
        ItemQuantity.increaseQuantity(transferData.from_warehouse_id, transferData.item_id, transferData.quantity, (err, updateResult) => {
          if (err) return res.status(500).json({ error: i18n.__('messages.error_increasing_item_quantity') });
  
          // Decrease item quantity in to_warehouse_id
          ItemQuantity.decreaseQuantity(transferData.to_warehouse_id, transferData.item_id, transferData.quantity, (err, updateResult) => {
            if (err) return res.status(500).json({ error: i18n.__('messages.error_decreasing_item_quantity') });
            res.status(200).json({ message: i18n.__('messages.transfer_deleted') });
          });
        });
      });
    });
  };