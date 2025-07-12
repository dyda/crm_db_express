const Currency = require('../../models/Currency/Currency');
const i18n = require('../../config/i18nConfig');

// Example validation function
function validateCurrency(data) {
  if (!data.name) return i18n.__('currency.name_required');
  if (!data.symbol) return i18n.__('currency.symbol_required');
  if (typeof data.exchange_rate !== 'number') return i18n.__('currency.exchange_rate_required');
  return null;
}

exports.create = (req, res) => {
  const validationError = validateCurrency(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  Currency.create(req.body, (err, result) => {
    if (err) return res.status(400).json({ error: i18n.__('currency.create_failed') });
    res.status(201).json({ message: i18n.__('currency.create_success'), id: result.insertId, ...req.body });
  });
};

exports.getAll = (req, res) => {
  Currency.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: i18n.__('currency.fetch_failed') });
    res.json(rows);
  });
};

exports.getById = (req, res) => {
  Currency.getById(req.params.id, (err, rows) => {
    if (err) return res.status(500).json({ error: i18n.__('currency.fetch_failed') });
    if (!rows.length) return res.status(404).json({ error: i18n.__('currency.not_found') });
    res.json(rows[0]);
  });
};



exports.getBaseCurrency = (req, res) => {
  Currency.getBaseCurrency((err, rows) => {
    if (err) return res.status(500).json({ error: i18n.__('currency.fetch_failed') });
    if (!rows.length) return res.status(404).json({ error: i18n.__('currency.base_not_found') });
    res.json(rows[0]);
  });
};


exports.update = (req, res) => {
  const validationError = validateCurrency(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  Currency.update(req.params.id, req.body, (err, result) => {
    if (err) return res.status(400).json({ error: i18n.__('currency.update_failed') });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('currency.not_found') });
    res.json({ message: i18n.__('currency.update_success'), id: req.params.id, ...req.body });
  });
};

exports.delete = (req, res) => {
  Currency.delete(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('currency.delete_failed') });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('currency.not_found') });
    res.json({ message: i18n.__('currency.delete_success') });
  });
};