const CurrencyConverter = require('../../models/Currency/CurrencyConvert');
const i18n = require('../../config/i18nConfig');

function validateConverter(data) {
  if (!data.currency_from_id) return i18n.__('validation.required.currency_from_id');
  if (!data.currency_to_id) return i18n.__('validation.required.currency_to_id');
  if (typeof data.amount_from !== 'number') return i18n.__('validation.required.amount_from');
  if (typeof data.amount_to !== 'number') return i18n.__('validation.required.amount_to');
  if (typeof data.rate_used !== 'number') return i18n.__('validation.required.rate_used');
  if (!data.converted_at) return i18n.__('validation.required.converted_at');
  return null;
}

exports.create = (req, res) => {
  const validationError = validateConverter(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  CurrencyConverter.create(req.body, (err, result) => {
    if (err) return res.status(400).json({ error: i18n.__('messages.error_creating_converter') });
    res.status(201).json({ message: i18n.__('messages.converter_created'), id: result.insertId, ...req.body });
  });
};

exports.getAll = (req, res) => {
  CurrencyConverter.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_converters') });
    res.json(rows);
  });
};

exports.getById = (req, res) => {
  CurrencyConverter.getById(req.params.id, (err, rows) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_converter') });
    if (!rows.length) return res.status(404).json({ error: i18n.__('messages.converter_not_found') });
    res.json(rows[0]);
  });
};

exports.update = (req, res) => {
  const validationError = validateConverter(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  CurrencyConverter.update(req.params.id, req.body, (err, result) => {
    if (err) return res.status(400).json({ error: i18n.__('messages.error_updating_converter') });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('messages.converter_not_found') });
    res.json({ message: i18n.__('messages.converter_updated'), id: req.params.id, ...req.body });
  });
};

exports.delete = (req, res) => {
  CurrencyConverter.delete(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_converter') });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('messages.converter_not_found') });
    res.json({ message: i18n.__('messages.converter_deleted') });
  });
};