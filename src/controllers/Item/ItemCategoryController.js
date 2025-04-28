const ItemCategory = require('../../models/Item/ItemCategory');
const i18n = require('../../config/i18nConfig'); // Import i18n for localization

// Create Item Category
exports.createItemCategory = (req, res) => {
  const categoryData = req.body;

  // Validate required fields
  if (!categoryData.name) {
    return res.status(400).json({ error: i18n.__('validation.required.item_category_name') });
  }

  ItemCategory.create(categoryData, (err, result) => {
    if (err) {
      if (err.message === 'Category name must be unique') {
        return res.status(400).json({ error: i18n.__('validation.unique.item_category_name') });
      }
      return res.status(500).json({ error: i18n.__('messages.error_creating_item_category') });
    }
    res.status(201).json({ message: i18n.__('messages.item_category_created'), id: result.insertId });
  });
};

// Get All Item Categories
exports.getAllItemCategories = (req, res) => {
  ItemCategory.getAll((err, results) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_item_categories') });
    res.status(200).json(results);
  });
};

// Get Item Category by ID
exports.getItemCategoryById = (req, res) => {
  const categoryId = req.params.id;
  ItemCategory.getById(categoryId, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_item_category') });
    if (result.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.item_category_not_found') });
    res.status(200).json(result[0]);
  });
};

// Update Item Category
exports.updateItemCategory = (req, res) => {
  const categoryId = req.params.id;
  const categoryData = req.body;

  // Validate required fields
  if (!categoryData.name) {
    return res.status(400).json({ error: i18n.__('validation.required.item_category_name') });
  }

  ItemCategory.update(categoryId, categoryData, (err, result) => {
    if (err) {
      if (err.message === 'Category name must be unique') {
        return res.status(400).json({ error: i18n.__('validation.unique.item_category_name') });
      }
      return res.status(500).json({ error: i18n.__('messages.error_updating_item_category') });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.item_category_not_found') });
    res.status(200).json({ message: i18n.__('messages.item_category_updated') });
  });
};

// Delete Item Category
exports.deleteItemCategory = (req, res) => {
  const categoryId = req.params.id;
  ItemCategory.deleteSoft(categoryId, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_item_category') });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.item_category_not_found') });
    res.status(200).json({ message: i18n.__('messages.item_category_deleted') });
  });
};
