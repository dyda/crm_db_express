const Currency = require('../models/Currency/Currency');
const i18n = require('../config/i18nConfig');

// Get base currency id
const getBaseCurrencyId = () =>
  new Promise((resolve, reject) => {
    Currency.getBaseCurrency((err, rows) => {
      if (err || !rows || !rows.length) return reject(i18n.__('currency.base_not_found'));
      resolve(rows[0].id);
    });
  });

// Get exchange rate for a currency (relative to base)
const getExchangeRate = (currency_id) =>
  new Promise((resolve, reject) => {
    Currency.getById(currency_id, (err, rows) => {
      if (err || !rows || !rows.length) return reject(i18n.__('currency_not_found'));
      const rate = Number(rows[0].exchange_rate) || 1;
      if (rate === 0) return reject(i18n.__('messages.exchange_rate_zero'));
      resolve(rate);
    });
  });

// Convert amount to base currency
const convertToBaseCurrency = async (amount, currency_id) => {
  const baseCurrencyId = await getBaseCurrencyId();
  if (Number(currency_id) === Number(baseCurrencyId)) return { amountInBase: Number(amount), exchange_rate: 1 };

  const exchange_rate = await getExchangeRate(currency_id);
  if (exchange_rate === 0) throw new Error('Exchange rate cannot be zero');
  const amountInBase = Number(amount) / Number(exchange_rate);
  return { amountInBase, exchange_rate };
};

module.exports = {
  getBaseCurrencyId,
  getExchangeRate,
  convertToBaseCurrency,
};