const CompanyCapital = require('../../models/Capital/Capital');
const i18n = require('../../config/i18nConfig');

// Create Capital
exports.createCapital = (req, res) => {
  const { company_id, amount, date } = req.body;

  // Validate required fields
  if (!company_id) {
    return res.status(400).json({ error: i18n.__('validation.required.company_id') });
  }
  if (!amount) {
    return res.status(400).json({ error: i18n.__('validation.required.amount') });
  }
  if (!date) {
    return res.status(400).json({ error: i18n.__('validation.required.date') });
  }

  const capitalData = { company_id, amount, date };
  CompanyCapital.create(capitalData, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: i18n.__('messages.capital_created'), id: result.insertId });
  });
};

// Get All Capitals
exports.getAllCapitals = (req, res) => {
  CompanyCapital.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
};

// Get Capital by ID
exports.getCapitalById = (req, res) => {
  const { id } = req.params;
  CompanyCapital.getById(id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.capital_not_found') });
    res.status(200).json(result[0]);
  });
};

// Update Capital
exports.updateCapital = (req, res) => {
  const { id } = req.params;
  const { company_id, amount, date } = req.body;

  // Validate required fields
  if (!company_id) {
    return res.status(400).json({ error: i18n.__('validation.required.company_id') });
  }
  if (!amount) {
    return res.status(400).json({ error: i18n.__('validation.required.amount') });
  }
  if (!date) {
    return res.status(400).json({ error: i18n.__('validation.required.date') });
  }

  const capitalData = { company_id, amount, date };
  CompanyCapital.update(id, capitalData, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.capital_not_found') });
    res.status(200).json({ message: i18n.__('messages.capital_updated') });
  });
};

// Delete Capital
exports.deleteCapital = (req, res) => {
  const { id } = req.params;
  CompanyCapital.deleteSoft(id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.capital_not_found') });
    res.status(200).json({ message: i18n.__('messages.capital_deleted') });
  });
};