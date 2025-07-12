const db = require('../../config/db');

class Currency {
  static create(data, callback) {
    const query = `INSERT INTO currency (name, symbol, exchange_rate, is_base, updated_at)
                   VALUES (?, ?, ?, ?, NOW())`;
    const values = [data.name, data.symbol, data.exchange_rate, data.is_base || 0];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = 'SELECT * FROM currency WHERE deleted_at IS NULL';
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = 'SELECT * FROM currency WHERE id = ? AND deleted_at IS NULL';
    db.query(query, [id], callback);
  }

  static getBaseCurrency(callback) {
    const query = 'SELECT * FROM currency WHERE is_base = 1 AND deleted_at IS NULL LIMIT 1';
    db.query(query, callback);
  }


  static getExchangeRateById(id, callback) {
    const query = 'SELECT exchange_rate FROM currency WHERE id = ? AND deleted_at IS NULL';
    db.query(query, [id], callback);
  }

  static updateExchangeRate(id, exchangeRate, callback) {
    const query = 'UPDATE currency SET exchange_rate = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL';
    db.query(query, [exchangeRate, id], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE currency SET name = ?, symbol = ?, exchange_rate = ?, is_base = ?, updated_at = NOW()
                   WHERE id = ? AND deleted_at IS NULL`;
    const values = [data.name, data.symbol, data.exchange_rate, data.is_base || 0, id];
    db.query(query, values, callback);
  }

  // Soft delete: set deleted_at to NOW()
  static delete(id, callback) {
    const query = 'UPDATE currency SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL';
    db.query(query, [id], callback);
  }
}

module.exports = Currency;