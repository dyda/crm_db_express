
const ItemDamage = require('../../models/Item/ItemDamage');
const ItemQuantity = require('../../models/Item/ItemQuantity');
const ItemUnit = require('../../models/Item/ItemUnit');
const i18n = require('../../config/i18nConfig'); // Import i18n for localization


// Helper: get conversion factor for unit
const getConversionFactor = (unit_id, callback) => {
  ItemUnit.getById(unit_id, (err, unitResult) => {
    if (err || !unitResult || unitResult.length === 0) return callback(1); // Default to 1 if not found
    callback(unitResult[0].conversion_factor || 1);
  });
};


// Helper: validate required fields using i18n
const validateRequiredFields = (fields) => {
  if (!fields.warehouse_id) return i18n.__('validation.required.warehouse_id');
  if (!fields.item_id) return i18n.__('validation.required.item_id');
  if (!fields.unit_id) return i18n.__('validation.required.unit_id');
  if (fields.quantity === undefined || fields.quantity === null) return i18n.__('validation.required.quantity');
  return null;
};


// CREATE: Log damage and decrease item quantity in warehouse/unit
exports.create = (req, res) => {
  const validationError = validateRequiredFields(req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  const { warehouse_id, item_id, unit_id, quantity } = req.body;

  // Use ItemQuantity.exists for validation
  ItemQuantity.exists(warehouse_id, item_id, (err, exists) => {
    if (err) return res.status(500).json({ error: err });
    if (!exists) {
      return res.status(400).json({ error: i18n.__('validation.invalid.item_quantity_not_found') });
    }

    ItemDamage.create(req.body, (err, result) => {
      if (err) return res.status(500).json({ error: err });

      // Decrease item quantity in warehouse/unit (convert to base unit)
      getConversionFactor(unit_id, (conversion) => {
        const baseQty = parseFloat(quantity) * parseFloat(conversion);
        ItemQuantity.decreaseQuantity(warehouse_id, item_id, baseQty, (err2) => {
          if (err2) return res.status(500).json({ error: err2 });
          res.json({ success: true, id: result.insertId });
        });
      });
    });
  });
};

exports.getAll = (req, res) => {
  ItemDamage.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
};

exports.getById = (req, res) => {
  ItemDamage.getById(req.params.id, (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    if (!rows.length) return res.status(404).json({ error: i18n.__('validation.invalid.damage_not_found') });
    res.json(rows[0]);
  });
};

// FILTER (with sort & pagination)
exports.getByFilters = (req, res) => {
  const filters = req.query;
  ItemDamage.getByFilters(filters, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
};

// UPDATE: Adjust quantity difference (old vs new) in warehouse/unit
exports.update = (req, res) => {
  const validationError = validateRequiredFields(req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  const id = req.params.id;
  ItemDamage.getById(id, (err, oldRows) => {
    if (err) return res.status(500).json({ error: err });
    if (!oldRows.length) return res.status(404).json({ error: i18n.__('validation.invalid.damage_not_found') });
    const old = oldRows[0];
    const { warehouse_id, item_id, unit_id, quantity } = req.body;

    // Validate item_quantity existence before update
    ItemQuantity.exists(warehouse_id, item_id, (err, exists) => {
      if (err) return res.status(500).json({ error: err });
      if (!exists) {
        return res.status(400).json({ error: i18n.__('validation.invalid.item_quantity_not_found') });
      }

      // Get conversion factors for old and new units
      getConversionFactor(old.unit_id, (oldConv) => {
        getConversionFactor(unit_id, (newConv) => {
          const oldBaseQty = parseFloat(old.quantity) * parseFloat(oldConv);
          const newBaseQty = parseFloat(quantity) * parseFloat(newConv);
          const diff = newBaseQty - oldBaseQty;

          // If warehouse or item changed, revert old, apply new
          if (old.warehouse_id !== warehouse_id || old.item_id !== item_id) {
            // 1. Revert old
            ItemQuantity.increaseQuantity(old.warehouse_id, old.item_id, oldBaseQty, (err1) => {
              if (err1) return res.status(500).json({ error: err1 });
              // 2. Apply new
              ItemQuantity.decreaseQuantity(warehouse_id, item_id, newBaseQty, (err2) => {
                if (err2) return res.status(500).json({ error: err2 });
                ItemDamage.update(id, req.body, (err3) => {
                  if (err3) return res.status(500).json({ error: err3 });
                  res.json({ success: true });
                });
              });
            });
          } else {
            // Same warehouse/item, just adjust difference
            if (diff !== 0) {
              if (diff > 0) {
                // Need to decrease more
                ItemQuantity.decreaseQuantity(warehouse_id, item_id, diff, (err2) => {
                  if (err2) return res.status(500).json({ error: err2 });
                  ItemDamage.update(id, req.body, (err3) => {
                    if (err3) return res.status(500).json({ error: err3 });
                    res.json({ success: true });
                  });
                });
              } else {
                // Need to increase back
                ItemQuantity.increaseQuantity(warehouse_id, item_id, Math.abs(diff), (err2) => {
                  if (err2) return res.status(500).json({ error: err2 });
                  ItemDamage.update(id, req.body, (err3) => {
                    if (err3) return res.status(500).json({ error: err3 });
                    res.json({ success: true });
                  });
                });
              }
            } else {
              // Only update damage record
              ItemDamage.update(id, req.body, (err3) => {
                if (err3) return res.status(500).json({ error: err3 });
                res.json({ success: true });
              });
            }
          }
        });
      });
    });
  });
};

// SOFT DELETE: Restore quantity in warehouse/unit
exports.deleteSoft = (req, res) => {
  const id = req.params.id;
  ItemDamage.getById(id, (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    if (!rows.length) return res.status(404).json({ error: i18n.__('validation.invalid.damage_not_found') });
    const damage = rows[0];
    getConversionFactor(damage.unit_id, (conversion) => {
      const baseQty = parseFloat(damage.quantity) * parseFloat(conversion);
      // Restore quantity
      ItemQuantity.increaseQuantity(damage.warehouse_id, damage.item_id, baseQty, (err2) => {
        if (err2) return res.status(500).json({ error: err2 });
        ItemDamage.deleteSoft(id, (err3) => {
          if (err3) return res.status(500).json({ error: err3 });
          res.json({ success: true });
        });
      });
    });
  });
};