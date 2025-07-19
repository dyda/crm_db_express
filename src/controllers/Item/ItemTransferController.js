const ItemTransfer = require('../../models/Item/ItemTransfer');
const ItemQuantity = require('../../models/Item/ItemQuantity');
const ItemUnit = require('../../models/Item/ItemUnit');
const i18n = require('../../config/i18nConfig'); // Import i18n for localization


const getConversionFactor = (unit_id, callback) => {
  ItemUnit.getById(unit_id, (err, unitResult) => {
    if (err || !unitResult || unitResult.length === 0) return callback(1); // Default to 1 if not found
    callback(unitResult[0].conversion_factor || 1);
  });
};


// Create Item Transfer
exports.createTransfer = (req, res) => {
  const { item_id, from_warehouse_id, to_warehouse_id, unit_id, quantity, employee_id, note, transfer_date } = req.body;

  // Validate required fields (add unit_id and transfer_date)
  if (!item_id) return res.status(400).json({ error: i18n.__('validation.required.item_id') });
  if (!from_warehouse_id) return res.status(400).json({ error: i18n.__('validation.required.from_warehouse_id') });
  if (!to_warehouse_id) return res.status(400).json({ error: i18n.__('validation.required.to_warehouse_id') });
  if (!unit_id) return res.status(400).json({ error: i18n.__('validation.required.unit_id') });
  if (!quantity) return res.status(400).json({ error: i18n.__('validation.required.quantity') });
  if (!employee_id) return res.status(400).json({ error: i18n.__('validation.required.employee_id') });
  if (!transfer_date) return res.status(400).json({ error: i18n.__('validation.required.transfer_date') });

  getConversionFactor(unit_id, (conversion) => {
    const baseQty = parseFloat(quantity) * parseFloat(conversion);

    // Check if item is available in from_warehouse_id
    ItemQuantity.getByWarehouseAndItem(from_warehouse_id, item_id, (err, result) => {
      if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_item_quantity') });
      if (result.length === 0 ) {
        return res.status(400).json({ error: i18n.__('validation.invalid.insufficient_quantity') });
      }

      // Decrease item  from from_warehouse_id
      ItemQuantity.decreaseQuantity(from_warehouse_id, item_id, baseQty, (err) => {
        if (err) return res.status(500).json({ error: i18n.__('messages.error_decreasing_item_quantity') });

        // Increase item quantity in to_warehouse_id
        ItemQuantity.increaseQuantity(to_warehouse_id, item_id, baseQty, (err) => {
          if (err) return res.status(500).json({ error: i18n.__('messages.error_increasing_item_quantity') });

          // Create item transfer record
          const transferData = { item_id, from_warehouse_id, to_warehouse_id, unit_id, quantity, employee_id, note, transfer_date };
          ItemTransfer.create(transferData, (err, result) => {
            if (err) return res.status(500).json({ error: i18n.__('messages.error_creating_transfer') });
            res.status(201).json({ message: i18n.__('messages.transfer_created'), id: result.insertId });
          });
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
  // Accept filters, sorting, and pagination from query params
  const {
    from_warehouse_id,
    to_warehouse_id,
    item_id,
    unit_id,
    employee_id,
    startDate,
    endDate,
    sortBy = 'id',
    sortOrder = 'desc',
    page = 1,
    pageSize = 20
  } = req.query;

  const filters = {
    from_warehouse_id,
    to_warehouse_id,
    item_id,
    unit_id,
    employee_id,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    page: Number(page),
    pageSize: Number(pageSize)
  };

  ItemTransfer.getByFilters(filters, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_transfers') });
    res.status(200).json({
      message: i18n.__('messages.transfers_found', { count: result.total }),
      ...result
    });
  });
};

// Update Item Transfer
exports.updateTransfer = (req, res) => {
  const { id } = req.params;
  const { item_id, from_warehouse_id, to_warehouse_id, unit_id, quantity, employee_id, note, transfer_date } = req.body;

  // Validate required fields
  if (!item_id) return res.status(400).json({ error: i18n.__('validation.required.item_id') });
  if (!from_warehouse_id) return res.status(400).json({ error: i18n.__('validation.required.from_warehouse_id') });
  if (!to_warehouse_id) return res.status(400).json({ error: i18n.__('validation.required.to_warehouse_id') });
  if (!unit_id) return res.status(400).json({ error: i18n.__('validation.required.unit_id') });
  if (!quantity) return res.status(400).json({ error: i18n.__('validation.required.quantity') });
  if (!employee_id) return res.status(400).json({ error: i18n.__('validation.required.employee_id') });
  if (!transfer_date) return res.status(400).json({ error: i18n.__('validation.required.transfer_date') });

  ItemTransfer.getById(id, (err, existingTransfer) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_transfer') });
    if (!existingTransfer || existingTransfer.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.transfer_not_found') });
    const oldTransfer = existingTransfer[0];

    getConversionFactor(oldTransfer.unit_id, (oldConv) => {
      getConversionFactor(unit_id, (newConv) => {
        const oldBaseQty = parseFloat(oldTransfer.quantity) * parseFloat(oldConv);
        const newBaseQty = parseFloat(quantity) * parseFloat(newConv);
        const diff = newBaseQty - oldBaseQty;

        const transferData = { item_id, from_warehouse_id, to_warehouse_id, unit_id, quantity, employee_id, note, transfer_date };

        ItemTransfer.update(id, transferData, (err, result) => {
          if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_transfer') });
          if (result.affectedRows === 0) {
            return res.status(404).json({ error: i18n.__('validation.invalid.transfer_not_found') });
          }
          // Adjust item quantities based on the difference
          if (diff !== 0) {
            if (diff > 0) {
              ItemQuantity.decreaseQuantity(from_warehouse_id, item_id, diff, (err) => {
                if (err) return res.status(500).json({ error: i18n.__('messages.error_decreasing_item_quantity') });
                ItemQuantity.increaseQuantity(to_warehouse_id, item_id, diff, (err) => {
                  if (err) return res.status(500).json({ error: i18n.__('messages.error_increasing_item_quantity') });
                  res.status(200).json({ message: i18n.__('messages.transfer_updated') });
                });
              });
            } else {
              const positiveDiff = Math.abs(diff);
              ItemQuantity.increaseQuantity(from_warehouse_id, item_id, positiveDiff, (err) => {
                if (err) return res.status(500).json({ error: i18n.__('messages.error_increasing_item_quantity') });
                ItemQuantity.decreaseQuantity(to_warehouse_id, item_id, positiveDiff, (err) => {
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
    });
  });
};

// Delete Item Transfer
exports.deleteTransfer = (req, res) => {
  const { id } = req.params;

  ItemTransfer.getById(id, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_transfer') });
    if (!result.length) return res.status(404).json({ error: i18n.__('validation.invalid.transfer_not_found') });
    const transferData = result[0];

    getConversionFactor(transferData.unit_id, (conversion) => {
      const baseQty = parseFloat(transferData.quantity) * parseFloat(conversion);

      ItemTransfer.deleteSoft(id, (err, deleteResult) => {
        if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_transfer') });
        if (deleteResult.affectedRows === 0) {
          return res.status(404).json({ error: i18n.__('validation.invalid.transfer_not_found') });
        }
        // Increase item quantity in from_warehouse_id
        ItemQuantity.increaseQuantity(transferData.from_warehouse_id, transferData.item_id, baseQty, (err) => {
          if (err) return res.status(500).json({ error: i18n.__('messages.error_increasing_item_quantity') });

          // Decrease item quantity in to_warehouse_id
          ItemQuantity.decreaseQuantity(transferData.to_warehouse_id, transferData.item_id, baseQty, (err) => {
            if (err) return res.status(500).json({ error: i18n.__('messages.error_decreasing_item_quantity') });
            res.status(200).json({ message: i18n.__('messages.transfer_deleted') });
          });
        });
      });
    });
  });
};