const ItemPriceType = require('../../models/Item/ItemPriceType');
const i18n = require('../../config/i18nConfig'); // Import i18n for localization

// Create Item Price Type
exports.createItemPriceType = (req, res) => {
  const itemPriceTypeData = req.body;

  // Validate required fields
  if (!itemPriceTypeData.name) {
    return res.status(400).json({ error: i18n.__('validation.required.item_price_type_name') });
  }

  ItemPriceType.create(itemPriceTypeData, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage.includes('name')) {
        return res.status(400).json({ error: i18n.__('validation.unique.item_price_type_name') });
      }
      return res.status(500).json({ error: i18n.__('messages.error_creating_item_price_type') });
    }
    res.status(201).json({ message: i18n.__('messages.item_price_type_created'), id: result.insertId });
  });
};

// Get All Item Price Types
exports.getAllItemPriceTypes = (req, res) => {
  ItemPriceType.getAll((err, results) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_item_price_types') });
    }
    res.status(200).json(results);
  });
};

// Get Item Price Type by ID
exports.getItemPriceTypeById = (req, res) => {
  const itemPriceTypeId = req.params.id;
  ItemPriceType.getById(itemPriceTypeId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_item_price_type') });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.item_price_type_not_found') });
    }
    res.status(200).json(result[0]);
  });
};

// Update Item Price Type
exports.updateItemPriceType = (req, res) => {
  const itemPriceTypeId = req.params.id;
  const itemPriceTypeData = req.body;

   // Validate required fields
   if (!itemPriceTypeData.name) {
    return res.status(400).json({ error: i18n.__('validation.required.item_price_type_name') });
  }

  ItemPriceType.update(itemPriceTypeId, itemPriceTypeData, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage.includes('name')) {
        return res.status(400).json({ error: i18n.__('validation.unique.item_price_type_name') });
      }
      return res.status(500).json({ error: i18n.__('messages.error_updating_item_price_type') });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.item_price_type_not_found') });
    }
    res.status(200).json({ message: i18n.__('messages.item_price_type_updated') });
  });
};

// Delete Item Price Type
exports.deleteItemPriceType = (req, res) => {
  const itemPriceTypeId = req.params.id;
  ItemPriceType.deleteSoft(itemPriceTypeId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_deleting_item_price_type') });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.item_price_type_not_found') });
    }
    res.status(200).json({ message: i18n.__('messages.item_price_type_deleted') });
  });
};