const Warehouse = require('../../models/Warehouse/Warehouse');
const i18n = require('../../config/i18nConfig'); // Import i18n for localization

// Create warehouse
exports.create = (req, res) => {
  const { name, phone_1, phone_2, address, note,branch_id } = req.body;

// Validate input
if (!name) {
  return res.status(400).json({ error: i18n.__('validation.required.warehouse_name') });
}
if (!phone_1) {
  return res.status(400).json({ error: i18n.__('validation.required.phone_1') });
}
if (!branch_id) {
  return res.status(400).json({ error: i18n.__('validation.required.branch_id') });
}

  // Prepare data for saving
  const warehouseData = { name, phone_1, phone_2, address, note,branch_id };
  
  Warehouse.create(warehouseData, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_creating_warehouse') });
    res.status(201).json({ message: i18n.__('messages.warehouse_created'), warehouse: { id: result.insertId, ...warehouseData } });
  });
};

// Get all warehouses
exports.getAll = (req, res) => {
  Warehouse.getAll((err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_warehouses') });
    res.status(200).json(result);
  });
};

// Get warehouse by ID
exports.getById = (req, res) => {
  const { id } = req.params;
  Warehouse.getById(id, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_warehouse') });
    if (result.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.warehouse_not_found') });
    res.status(200).json(result[0]);
  });
};

// Update warehouse
exports.update = (req, res) => {
  const { id } = req.params;
  const { name, phone_1, phone_2, address, note,branch_id } = req.body;

   // Validate input
   if (!name) {
    return res.status(400).json({ error: i18n.__('validation.required.warehouse_name') });
  }
  if (!phone_1) {
    return res.status(400).json({ error: i18n.__('validation.required.phone_1') });
  }
  if (!branch_id) {
    return res.status(400).json({ error: i18n.__('validation.required.branch_id') });
  }

  // Prepare data for updating
  const warehouseData = { name, phone_1, phone_2, address, note,branch_id };

  Warehouse.update(id, warehouseData, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_warehouse') });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.warehouse_not_found') });
    res.status(200).json({ message: i18n.__('messages.warehouse_updated') });
  });
};

// Soft delete warehouse
exports.delete = (req, res) => {
  const { id } = req.params;
  Warehouse.delete(id, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_warehouse') });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.warehouse_not_found') });
    res.status(200).json({ message: i18n.__('messages.warehouse_deleted') });
  });
};

// Get all warehouses by branch_id
exports.getBranchWarehouse = (req, res) => {
  const { branch_id } = req.params;
  Warehouse.getBranchWarehouse(branch_id, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_warehouses') });
    res.status(200).json(result);
  });
};