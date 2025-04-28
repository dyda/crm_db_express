const BuyItem = require('../../models/Buy/BuyItem');
const BuyInvoice = require('../../models/Buy/BuyInvoice'); // Import BuyInvoice model
const ItemQuantity = require('../../models/Item/ItemQuantity'); // Use ItemQuantity model
const ItemUnit = require('../../models/Item/ItemUnit'); // Import ItemUnit model
const i18n = require('../../config/i18nConfig');

// Create Buy Item
exports.createBuyItem = (req, res) => {
    const data = req.body;
  
    // Validate required fields
    if (!data.buy_invoice_id || !data.item_id || !data.item_unit_id || !data.quantity || !data.unit_price || !data.total_amount) {
      return res.status(400).json({ error: i18n.__('validation.required.fields') });
    }
  
    // Fetch the warehouse_id from the buy_invoice table
    BuyInvoice.getById(data.buy_invoice_id, (err, invoiceResult) => {
      if (err || invoiceResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.buy_invoice') });
      }
  
      const warehouse_id = invoiceResult[0].warehouse_id;
  
      // Fetch the conversion factor for the item unit
      ItemUnit.getById(data.item_unit_id, (err, unitResult) => {
        if (err || unitResult.length === 0) {
          return res.status(400).json({ error: i18n.__('validation.invalid.item_unit') });
        }
  
        const conversionFactor = unitResult[0].conversion_factor;
        const baseQuantity = data.quantity * conversionFactor;
  
        // Save the buy item
        BuyItem.create({ ...data, base_quantity: baseQuantity }, (err, result) => {
          if (err) return res.status(500).json({ error: i18n.__('messages.error_creating_buy_item') });
  
          // Increase item quantity in inventory
          ItemQuantity.increaseQuantity(warehouse_id, data.item_id, baseQuantity, (err) => {
            if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_inventory') });
            res.status(201).json({ message: i18n.__('messages.buy_item_created'), id: result.insertId });
          });
        });
      });
    });
  };

  // Get All Buy Items
exports.getAllBuyItems = (req, res) => {
  BuyItem.getAll((err, results) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_buy_items') });
    }
    res.status(200).json(results);
  });
};

// Get Buy Item by ID
exports.getBuyItemById = (req, res) => {
  const { id } = req.params;

  BuyItem.getById(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_buy_item') });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.buy_item_not_found') });
    }
    res.status(200).json(result[0]);
  });
};

// Update Buy Item
exports.updateBuyItem = (req, res) => {
    const { id } = req.params;
    const data = req.body;
  
    // Fetch the existing buy item to calculate quantity difference
    BuyItem.getById(id, (err, existingItem) => {
      if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_buy_item') });
      if (existingItem.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.buy_item_not_found') });
  
      const oldBaseQuantity = existingItem[0].base_quantity;
  
      // Fetch the warehouse_id from the buy_invoice table
      BuyInvoice.getById(existingItem[0].buy_invoice_id, (err, invoiceResult) => {
        if (err || invoiceResult.length === 0) {
          return res.status(400).json({ error: i18n.__('validation.invalid.buy_invoice') });
        }
  
        const warehouse_id = invoiceResult[0].warehouse_id;
  
        // Fetch the conversion factor for the new item unit
        ItemUnit.getById(data.item_unit_id, (err, unitResult) => {
          if (err || unitResult.length === 0) {
            return res.status(400).json({ error: i18n.__('validation.invalid.item_unit') });
          }
  
          const conversionFactor = unitResult[0].conversion_factor;
          const newBaseQuantity = data.quantity * conversionFactor;
  
          // Update the buy item
          BuyItem.update(id, { ...data, base_quantity: newBaseQuantity }, (err, result) => {
            if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_buy_item') });
            if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.buy_item_not_found') });
  
            // Adjust inventory based on quantity difference
            const quantityDifference = newBaseQuantity - oldBaseQuantity;
            ItemQuantity.increaseQuantity(warehouse_id, data.item_id, quantityDifference, (err) => {
              if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_inventory') });
              res.status(200).json({ message: i18n.__('messages.buy_item_updated') });
            });
          });
        });
      });
    });
  };

// Delete Buy Item
exports.deleteBuyItem = (req, res) => {
    const { id } = req.params;
  
    // Fetch the existing buy item to decrease inventory
    BuyItem.getById(id, (err, existingItem) => {
      if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_buy_item') });
      if (existingItem.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.buy_item_not_found') });
  
      const { item_id, base_quantity, buy_invoice_id } = existingItem[0];
  
      // Fetch the warehouse_id from the buy_invoice table
      BuyInvoice.getById(buy_invoice_id, (err, invoiceResult) => {
        if (err || invoiceResult.length === 0) {
          return res.status(400).json({ error: i18n.__('validation.invalid.buy_invoice') });
        }
  
        const warehouse_id = invoiceResult[0].warehouse_id;
  
        // Soft delete the buy item
        BuyItem.deleteSoft(id, (err, result) => {
          if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_buy_item') });
          if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.buy_item_not_found') });
  
          // Decrease item quantity in inventory
          ItemQuantity.decreaseQuantity(warehouse_id, item_id, base_quantity, (err) => {
            if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_inventory') });
            res.status(200).json({ message: i18n.__('messages.buy_item_deleted') });
          });
        });
      });
    });
  };