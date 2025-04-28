const Item = require('../../models/Item/Item');
const i18n = require('../../config/i18nConfig'); // Import i18n for localization

// Create Item
exports.createItem = (req, res) => {
  const itemData = req.body;

    // Validate required fields
    // Validate required fields
  if (!itemData.name) {
    return res.status(400).json({ error: i18n.__('validation.required.item_name') });
  }
  if (!itemData.cost) {
    return res.status(400).json({ error: i18n.__('validation.required.item_cost') });
  }
  
   // Set default values for optional fields
  itemData.brand_id = itemData.brand_id || 0;
  itemData.category_id = itemData.category_id || 0;
  itemData.allow_zero_sell=itemData.allow_zero_sell || 1;

  Item.create(itemData, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        if (err.sqlMessage.includes('barcode')) {
          return res.status(400).json({ error: i18n.__('validation.unique.item_barcode') });
        }
        if (err.sqlMessage.includes('name')) {
          return res.status(400).json({ error: i18n.__('validation.unique.item_name') });
        }
      }
      return res.status(500).json({ error: i18n.__('messages.error_creating_item') });
    }
    res.status(201).json({ message: i18n.__('messages.item_created'), id: result.insertId });
  });
};

// Get All Items
exports.getAllItems = (req, res) => {
  Item.getAll((err, results) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_items') });
    }
    res.status(200).json(results);
  });
};

// Get Item by ID
exports.getItemById = (req, res) => {
  const itemId = req.params.id;
  Item.getById(itemId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_item') });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.item_not_found') });
    }
    res.status(200).json(result[0]);
  });
};

// Update Item
exports.updateItem = (req, res) => {
  const itemId = req.params.id;
  const itemData = req.body;

    // Validate required fields
  if (!itemData.name) {
    return res.status(400).json({ error: i18n.__('validation.required.item_name') });
  }
  if (!itemData.cost) {
    return res.status(400).json({ error: i18n.__('validation.required.item_cost') });
  }

   // Set default values for optional fields
   itemData.brand_id = itemData.brand_id || 0;
   itemData.category_id = itemData.category_id || 0;
   itemData.allow_zero_sell=itemData.allow_zero_sell || 1;
 
   Item.update(itemId, itemData, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        if (err.sqlMessage.includes('barcode')) {
          return res.status(400).json({ error: i18n.__('validation.unique.item_barcode') });
        }
        if (err.sqlMessage.includes('name')) {
          return res.status(400).json({ error: i18n.__('validation.unique.item_name') });
        }
      }
      return res.status(500).json({ error: i18n.__('messages.error_updating_item') });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.item_not_found') });
    }
    res.status(200).json({ message: i18n.__('messages.item_updated') });
  });
};

// Delete Item
exports.deleteItem = (req, res) => {
  const itemId = req.params.id;
  Item.deleteSoft(itemId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_deleting_item') });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.item_not_found') });
    }
    res.status(200).json({ message: i18n.__('messages.item_deleted') });
  });
};




