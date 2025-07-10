const db = require('../../config/db');

class CurrencyRate {

   static create(data, callback) {
    const query = `
      INSERT INTO currency_rates 
        (base_currency_id, currency_id, base_amount, target_amount, price_date, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    const values = [
      data.base_currency_id,
      data.currency_id,
      data.base_amount,
      data.target_amount,
      data.price_date
    ];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = `SELECT * FROM currency_rates WHERE deleted_at IS NULL ORDER BY price_date DESC`;
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = `SELECT * FROM currency_rates WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [id], callback);
  }

  static getHistory(currency_id, callback) {
    const query = `SELECT * FROM currency_rates WHERE currency_id = ? AND deleted_at IS NULL ORDER BY price_date DESC`;
    db.query(query, [currency_id], callback);
  }

  static update(id, data, callback) {
    const query = `
      UPDATE currency_rates 
      SET base_currency_id = ?, currency_id = ?, base_amount = ?, target_amount = ?, price_date = ?
      WHERE id = ? AND deleted_at IS NULL
    `;
    const values = [
      data.base_currency_id,
      data.currency_id,
      data.base_amount,
      data.target_amount,
      data.price_date,
      id
    ];
    db.query(query, values, callback);
  }

  static delete(id, callback) {
    const query = `UPDATE currency_rates SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [id], callback);
  }



}

module.exports = CurrencyRate;