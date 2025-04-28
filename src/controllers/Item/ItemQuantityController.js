const ItemQuantity = require('../../models/Item/ItemQuantity');
const Item = require('../../models/Item/Item');
const Warehouse = require('../../models/Warehouse/Warehouse');
const i18n = require('../../config/i18nConfig'); // Import i18n for localization

// Create Item Quantity
exports.createItemQuantity = (req, res) => {
  const itemQuantityData = req.body;

  // Validate required fields
  if (!itemQuantityData.warehouse_id) {
    return res.status(400).json({ error: i18n.__('validation.required.warehouse_id') });
  }
  if (!itemQuantityData.item_id) {
    return res.status(400).json({ error: i18n.__('validation.required.item_id') });
  }
  if (itemQuantityData.quantity === undefined) {
    return res.status(400).json({ error: i18n.__('validation.required.quantity') });
  }

  ItemQuantity.create(itemQuantityData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_creating_item_quantity') });
    }
    res.status(201).json({ message: i18n.__('messages.item_quantity_created'), id: result.insertId });
  });
};

// Get All Item Quantities
exports.getAllItemQuantities = (req, res) => {
  ItemQuantity.getAll((err, results) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_item_quantities') });
    }
    res.status(200).json(results);
  });
};

// Get Item Quantity by ID
exports.getItemQuantityById = (req, res) => {
  const itemQuantityId = req.params.id;
  ItemQuantity.getById(itemQuantityId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_item_quantity') });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.item_quantity_not_found') });
    }
    res.status(200).json(result[0]);
  });
};

// Update Item Quantity
exports.updateItemQuantity = (req, res) => {
  const itemQuantityId = req.params.id;
  const itemQuantityData = req.body;

 // Validate required fields
 if (!itemQuantityData.warehouse_id) {
  return res.status(400).json({ error: i18n.__('validation.required.warehouse_id') });
}
if (!itemQuantityData.item_id) {
  return res.status(400).json({ error: i18n.__('validation.required.item_id') });
}
if (itemQuantityData.quantity === undefined) {
  return res.status(400).json({ error: i18n.__('validation.required.quantity') });
}

  ItemQuantity.update(itemQuantityId, itemQuantityData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_updating_item_quantity') });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.item_quantity_not_found') });
    }
    res.status(200).json({ message: i18n.__('messages.item_quantity_updated') });
  });
};

// Soft Delete Item Quantity
exports.deleteItemQuantity = (req, res) => {
  const itemQuantityId = req.params.id;
  ItemQuantity.deleteSoft(itemQuantityId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_deleting_item_quantity') });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.item_quantity_not_found') });
    }
    res.status(200).json({ message: i18n.__('messages.item_quantity_deleted') });
  });
};

// Increase Item Quantity
exports.increaseItemQuantity = (req, res) => {
  const { warehouse_id, item_id, amount } = req.body;

  if (!warehouse_id) {
    return res.status(400).json({ error: i18n.__('validation.required.warehouse_id') });
  }
  if (!item_id) {
    return res.status(400).json({ error: i18n.__('validation.required.item_id') });
  }
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: i18n.__('validation.required.amount_positive') });
  }

  ItemQuantity.increaseQuantity(warehouse_id, item_id, amount, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_increasing_item_quantity') });
    }
    res.status(200).json({ message: i18n.__('messages.item_quantity_increased') });
  });
};

// Decrease Item Quantity
exports.decreaseItemQuantity = (req, res) => {
  const { warehouse_id, item_id, amount } = req.body;

  if (!warehouse_id) {
    return res.status(400).json({ error: i18n.__('validation.required.warehouse_id') });
  }
  if (!item_id) {
    return res.status(400).json({ error: i18n.__('validation.required.item_id') });
  }
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: i18n.__('validation.required.amount_positive') });
  }

  ItemQuantity.decreaseQuantity(warehouse_id, item_id, amount, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_decreasing_item_quantity') });
    }
    res.status(200).json({ message: i18n.__('messages.item_quantity_decreased') });
  });
};

// Get Item Quantity by Warehouse and Item
exports.getItemQuantityByWarehouseAndItem = (req, res) => {
  const { warehouse_id, item_id } = req.body;

  // Validate required fields
  if (!warehouse_id) {
    return res.status(400).json({ error: i18n.__('validation.required.warehouse_id') });
  }
  if (!item_id) {
    return res.status(400).json({ error: i18n.__('validation.required.item_id') });
  }

  ItemQuantity.getByWarehouseAndItem(warehouse_id, item_id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_item_quantity') });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.item_quantity_not_found') });
    }
    res.status(200).json(result[0]);
  });
};

