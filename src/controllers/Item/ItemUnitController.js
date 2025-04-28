const ItemUnit = require('../../models/Item/ItemUnit');
const i18n = require('../../config/i18nConfig'); // Import i18n for localization

// Create Item Unit
exports.createItemUnit = (req, res) => {
  const itemUnitData = req.body;

  // Validate required fields
  if (!itemUnitData.name) {
    return res.status(400).json({ error: i18n.__('validation.required.item_unit_name') });
  }
  if (itemUnitData.conversion_factor === undefined) {
    return res.status(400).json({ error: i18n.__('validation.required.conversion_factor') });
  }

  ItemUnit.create(itemUnitData, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage.includes('name')) {
        return res.status(400).json({ error: i18n.__('validation.unique.item_unit_name') });
      }
      return res.status(500).json({ error: i18n.__('messages.error_creating_item_unit') });
    }
    res.status(201).json({ message: i18n.__('messages.item_unit_created'), id: result.insertId });
  });
};

// Get All Item Units
exports.getAllItemUnits = (req, res) => {
  ItemUnit.getAll((err, results) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_item_units') });
    }
    res.status(200).json(results);
  });
};

// Get Item Unit by ID
exports.getItemUnitById = (req, res) => {
  const itemUnitId = req.params.id;
  ItemUnit.getById(itemUnitId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_item_unit') });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.item_unit_not_found') });
    }
    res.status(200).json(result[0]);
  });
};

// Update Item Unit
exports.updateItemUnit = (req, res) => {
  const itemUnitId = req.params.id;
  const itemUnitData = req.body;

  // Validate required fields
  if (!itemUnitData.name) {
    return res.status(400).json({ error: i18n.__('validation.required.item_unit_name') });
  }
  if (itemUnitData.conversion_factor === undefined) {
    return res.status(400).json({ error: i18n.__('validation.required.conversion_factor') });
  }

  ItemUnit.update(itemUnitId, itemUnitData, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage.includes('name')) {
        return res.status(400).json({ error: i18n.__('validation.unique.item_unit_name') });
      }
      return res.status(500).json({ error: i18n.__('messages.error_updating_item_unit') });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.item_unit_not_found') });
    }
    res.status(200).json({ message: i18n.__('messages.item_unit_updated') });
  });
};

// Soft Delete Item Unit
exports.deleteItemUnit = (req, res) => {
  const itemUnitId = req.params.id;
  ItemUnit.deleteSoft(itemUnitId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_deleting_item_unit') });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.item_unit_not_found') });
    }
    res.status(200).json({ message: i18n.__('messages.item_unit_deleted') });
  });
};