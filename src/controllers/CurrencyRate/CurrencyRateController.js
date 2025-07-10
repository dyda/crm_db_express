const CurrencyRate = require('../../models/CurrencyRate/CurrencyRate');
const Currency = require('../../models/Currency/Currency');
const i18n = require('../../config/i18nConfig');

// CREATE (Register Rate)
exports.create = (req, res) => {

const { base_currency_id, currency_id, base_amount, target_amount, price_date } = req.body;
if (!base_currency_id || !currency_id || !base_amount || !target_amount || !price_date) {
  return res.status(400).json({ error: 'All fields are required.' });
}
CurrencyRate.create({ base_currency_id, currency_id, base_amount, target_amount, price_date }, (err, result) => {
    if (err) {
      console.error('CurrencyRate.create error:', err);
      return res.status(400).json({ error: i18n.__('currency.rate_register_failed') });
    }

    // Calculate and update exchange_rate for the target currency
    // Example: exchange_rate = target_amount / base_amount (if base is USD, target is IQD, 100 USD = 150,000 IQD, exchange_rate = 150000/100 = 1500)
    const newExchangeRate = target_amount / base_amount;

    // Don't update base currency's own rate
    if (base_currency_id !== currency_id) {
      Currency.updateExchangeRate(currency_id, newExchangeRate, (errUpdate) => {
        if (errUpdate) console.error('Failed to update main currency exchange_rate:', errUpdate);
        return res.status(201).json({ message: i18n.__('currency.rate_register_success'), id: result.insertId });
      });
    } else {
      return res.status(201).json({ message: i18n.__('currency.rate_register_success'), id: result.insertId });
    }
  });
};

// UPDATE
exports.update = (req, res) => {
  const { id } = req.params;
  const { base_currency_id, currency_id, base_amount, target_amount, price_date } = req.body;
  if (!base_currency_id || !currency_id || !base_amount || !target_amount || !price_date) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  CurrencyRate.update(id, { base_currency_id, currency_id, base_amount, target_amount, price_date }, (err, result) => {
    if (err) return res.status(400).json({ error: i18n.__('currency.rate_update_failed') });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('currency.rate_not_found') });

    const newExchangeRate = target_amount / base_amount;
    if (base_currency_id !== currency_id) {
      Currency.updateExchangeRate(currency_id, newExchangeRate, (errUpdate) => {
        if (errUpdate) console.error('Failed to update main currency exchange_rate:', errUpdate);
        return res.json({ message: i18n.__('currency.rate_update_success'), id });
      });
    } else {
      return res.json({ message: i18n.__('currency.rate_update_success'), id });
    }
  });
};

// Note: The create and update methods now handle the exchange rate calculation and update the main currency's exchange rate.
exports.getAll = (req, res) => {
  CurrencyRate.getAll((err, results) => {
    if (err) return res.status(500).json({ error: i18n.__('currency.rate_fetch_failed') });
    res.json(results);
  });
};

exports.getById = (req, res) => {
  const { id } = req.params;
  CurrencyRate.getById(id, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('currency.rate_fetch_failed') });
    if (!result) return res.status(404).json({ error: i18n.__('currency.rate_not_found') });
    res.json(result);
  });
};

exports.delete = (req, res) => {
  const { id } = req.params;
  CurrencyRate.delete(id, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('currency.rate_delete_failed') });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('currency.rate_not_found') });
    res.json({ message: i18n.__('currency.rate_delete_success') });
  });
};

exports.getHistory = (req, res) => {
  const { currency_id } = req.params;
  CurrencyRate.getHistory(currency_id, (err, results) => {
    if (err) return res.status(500).json({ error: i18n.__('currency.rate_history_fetch_failed') });
    if (results.length === 0) return res.status(404).json({ error: i18n.__('currency.rate_history_not_found') });
    res.json(results);
  });
};
