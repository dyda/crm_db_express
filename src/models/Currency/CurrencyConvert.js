const db = require('../../config/db');

class CurrencyConverter {
  static create(data, callback) {
    const query = `INSERT INTO currency_converter 
      (currency_from_id, currency_to_id, amount_from, amount_to, rate_used, converted_at) 
      VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [
      data.currency_from_id,
      data.currency_to_id,
      data.amount_from,
      data.amount_to,
      data.rate_used,
      data.converted_at,
    ];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = 'SELECT * FROM currency_converter WHERE deleted_at IS NULL';
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = 'SELECT * FROM currency_converter WHERE id = ? AND deleted_at IS NULL';
    db.query(query, [id], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE currency_converter 
      SET currency_from_id = ?, currency_to_id = ?, amount_from = ?, amount_to = ?, rate_used = ?, converted_at = ?
      WHERE id = ? AND deleted_at IS NULL`;
    const values = [
      data.currency_from_id,
      data.currency_to_id,
      data.amount_from,
      data.amount_to,
      data.rate_used,
      data.converted_at,
      id,
    ];
    db.query(query, values, callback);
  }

  // Soft delete: set deleted_at to NOW()
  static delete(id, callback) {
    const query = 'UPDATE currency_converter SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL';
    db.query(query, [id], callback);
  }

    static restore(id, callback) {
        const query = 'UPDATE currency_converter SET deleted_at = NULL WHERE id = ?';
        db.query(query, [id], callback);
    }

    
}

module.exports = CurrencyConverter;