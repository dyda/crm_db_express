const Serial = require('../../models/Serial/Serial');
const i18n = require('../../config/i18nConfig');

// CREATE
exports.create = (req, res) => {
  const { type, name, note, date_at, branch_id } = req.body;
  if (!type) return res.status(400).json({ error: i18n.__('validation.required.serial_type') });
  if (!name) return res.status(400).json({ error: i18n.__('validation.required.serial_name') });
  if (!date_at) return res.status(400).json({ error: i18n.__('validation.required.serial_date_at') });
  if (!branch_id) return res.status(400).json({ error: i18n.__('validation.required.branch_id') });

  Serial.create({ type, name, note, date_at, branch_id }, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_creating_serial') });
    res.json({ success: true, id: result.insertId, message: i18n.__('messages.serial_created') });
  });
};

// READ ALL
exports.getAll = (req, res) => {

  Serial.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_serials') });
    res.json({ data: rows, message: i18n.__('messages.serials_found', { count: rows.length }) });
  });
};

// READ ONE
exports.getById = (req, res) => {

  Serial.getById(req.params.id, (err, row) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_serial') });
    if (!row) return res.status(404).json({ error: i18n.__('validation.invalid.serial_not_found') });
    res.json({ data: row, message: i18n.__('messages.serial_fetched', { id: req.params.id }) });
  });
};

// UPDATE
exports.update = (req, res) => {
  const { type, name, note, date_at, branch_id } = req.body;
  if (!type) return res.status(400).json({ error: i18n.__('validation.required.serial_type') });
  if (!name) return res.status(400).json({ error: i18n.__('validation.required.serial_name') });
  if (!date_at) return res.status(400).json({ error: i18n.__('validation.required.serial_date_at') });
  if (!branch_id) return res.status(400).json({ error: i18n.__('validation.required.branch_id') });

  Serial.update(req.params.id, { type, name, note, date_at, branch_id }, (err) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_serial') });
    res.json({ success: true, message: i18n.__('messages.serial_updated') });
  });
};

// SOFT DELETE
exports.deleteSoft = (req, res) => {

  Serial.deleteSoft(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_serial') });
    res.json({ success: true, message: i18n.__('messages.serial_deleted') });
  });
};

// FILTER with pagination and sort
exports.getByFilters = (req, res) => {
  const {
    type,
    name,
    date_from,
    date_to,
    sortBy = 'id',
    sortOrder = 'desc',
    page = 1,
    pageSize = 20,
    branch_id,
  } = req.query;

  const filters = {
    type,
    name,
    branch_id,
    startDate: date_from,
    endDate: date_to,
    sortBy,
    sortOrder,
    page: Number(page),
    pageSize: Number(pageSize),
  };

  Serial.getByFilters(filters, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_serials') });
    res.json({ ...result, message: i18n.__('messages.serials_found', { count: result.total }) });
  });
};