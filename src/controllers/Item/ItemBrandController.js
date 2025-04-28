const ItemBrand = require('../../models/Item/ItemBrand');
const i18n = require('../../config/i18nConfig'); // Import i18n for localization

// Create Item Brand
exports.createItemBrand = (req, res) => {
  const brandData = req.body;

  // Validate required fields
  if (!brandData.name) {
    return res.status(400).json({ error: i18n.__('validation.required.item_brand_name') });
  }

  ItemBrand.create(brandData, (err, result) => {
    if (err) {
      if (err.message === 'Brand name must be unique') {
        return res.status(400).json({ error: i18n.__('validation.unique.item_brand_name') });
      }
      return res.status(500).json({ error: i18n.__('messages.error_creating_item_brand') });
    }
    res.status(201).json({ message: i18n.__('messages.item_brand_created'), id: result.insertId });
  });
};

// Get All Item Brands
exports.getAllItemBrands = (req, res) => {
  ItemBrand.getAll((err, results) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_item_brands') });
    res.status(200).json(results);
  });
};

// Get Item Brand by ID
exports.getItemBrandById = (req, res) => {
  const brandId = req.params.id;
  ItemBrand.getById(brandId, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_item_brand') });
    if (result.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.item_brand_not_found') });
    res.status(200).json(result[0]);
  });
};

// Update Item Brand
exports.updateItemBrand = (req, res) => {
  const brandId = req.params.id;
  const brandData = req.body;

  // Validate required fields
  if (!brandData.name) {
    return res.status(400).json({ error: i18n.__('validation.required.item_brand_name') });
  }

  ItemBrand.update(brandId, brandData, (err, result) => {
    if (err) {
      if (err.message === 'Brand name must be unique') {
        return res.status(400).json({ error: i18n.__('validation.unique.item_brand_name') });
      }
      return res.status(500).json({ error: i18n.__('messages.error_updating_item_brand') });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.item_brand_not_found') });
    res.status(200).json({ message: i18n.__('messages.item_brand_updated') });
  });
};

// Delete Item Brand
exports.deleteItemBrand = (req, res) => {
  const brandId = req.params.id;
  ItemBrand.deleteSoft(brandId, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_item_brand') });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.item_brand_not_found') });
    res.status(200).json({ message: i18n.__('messages.item_brand_deleted') });
  });
};
