const ItemPrice = require('../../models/Item/ItemPrice');
const Item = require('../../models/Item/Item');
const ItemUnit = require('../../models/Item/ItemUnit');
const ItemPriceType = require('../../models/Item/ItemPriceType');
const i18n = require('../../config/i18nConfig'); // Import i18n for localization

// Create Item Price
exports.createItemPrice = (req, res) => {
  const itemPriceData = req.body;

    // Validate required fields
    if (!itemPriceData.item_id) {
      return res.status(400).json({ error: i18n.__('validation.required.item_id') });
    }
    if (!itemPriceData.unit_id) {
      return res.status(400).json({ error: i18n.__('validation.required.unit_id') });
    }
    if (!itemPriceData.price_type_id) {
      return res.status(400).json({ error: i18n.__('validation.required.price_type_id') });
    }
    if (itemPriceData.price === undefined) {
      return res.status(400).json({ error: i18n.__('validation.required.price') });
    }

  /// Check if item_id, unit_id, and price_type_id are valid
  Item.getById(itemPriceData.item_id, (err, itemResult) => {
    if (err || itemResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.item_id') });
    }

    ItemUnit.getById(itemPriceData.unit_id, (err, unitResult) => {
      if (err || unitResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.unit_id') });
      }

      ItemPriceType.getById(itemPriceData.price_type_id, (err, priceTypeResult) => {
        if (err || priceTypeResult.length === 0) {
          return res.status(400).json({ error: i18n.__('validation.invalid.price_type_id') });
        }

        ItemPrice.create(itemPriceData, (err, result) => {
          if (err) {
            return res.status(500).json({ error: i18n.__('messages.error_creating_item_price') });
          }
          res.status(201).json({ message: i18n.__('messages.item_price_created'), id: result.insertId });
        });
      });
    });
  });
};

  // Get All Item Prices
  exports.getAllItemPrices = (req, res) => {
    const itemId = req.query.item_id;
    if (!itemId) {
      return res.status(400).json({ error: 'item_id is required' });
    }
    ItemPrice.getAll(itemId, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching item prices' });
      }
      res.status(200).json(results);
    });
  };

// Get Item Price by ID
exports.getItemPriceById = (req, res) => {
  const itemPriceId = req.params.id;
  ItemPrice.getById(itemPriceId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_item_price') });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.item_price_not_found') });
    }
    res.status(200).json(result[0]);
  });
};

// Update Item Price
exports.updateItemPrice = (req, res) => {
  const itemPriceId = req.params.id;
  const itemPriceData = req.body;

  // Validate required fields
  if (!itemPriceData.item_id) {
    return res.status(400).json({ error: i18n.__('validation.required.item_id') });
  }
  if (!itemPriceData.unit_id) {
    return res.status(400).json({ error: i18n.__('validation.required.unit_id') });
  }
  if (!itemPriceData.price_type_id) {
    return res.status(400).json({ error: i18n.__('validation.required.price_type_id') });
  }
  if (itemPriceData.price === undefined) {
    return res.status(400).json({ error: i18n.__('validation.required.price') });
  }

  // Check if item_id, unit_id, and price_type_id are valid
  Item.getById(itemPriceData.item_id, (err, itemResult) => {
    if (err || itemResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.item_id') });
    }

    ItemUnit.getById(itemPriceData.unit_id, (err, unitResult) => {
      if (err || unitResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.unit_id') });
      }

      ItemPriceType.getById(itemPriceData.price_type_id, (err, priceTypeResult) => {
        if (err || priceTypeResult.length === 0) {
          return res.status(400).json({ error: i18n.__('validation.invalid.price_type_id') });
        }

        ItemPrice.update(itemPriceId, itemPriceData, (err, result) => {
          if (err) {
            return res.status(500).json({ error: i18n.__('messages.error_updating_item_price') });
          }
          if (result.affectedRows === 0) {
            return res.status(404).json({ error: i18n.__('validation.invalid.item_price_not_found') });
          }
          res.status(200).json({ message: i18n.__('messages.item_price_updated') });
        });
      });
    });
  });
};

// Delete Item Price
exports.deleteItemPrice = (req, res) => {
  const itemPriceId = req.params.id;
  ItemPrice.deleteSoft(itemPriceId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_deleting_item_price') });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.item_price_not_found') });
    }
    res.status(200).json({ message: i18n.__('messages.item_price_deleted') });
  });
};