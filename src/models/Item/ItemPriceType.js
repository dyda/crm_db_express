const db = require('../../config/db');

class ItemPriceType {
  static create(data, callback) {
    const query = `INSERT INTO item_price_type (name, created_at, updated_at)
                   VALUES (?, NOW(), NOW())`;
    const values = [data.name];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = 'SELECT * FROM item_price_type WHERE deleted_at IS NULL';
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = 'SELECT * FROM item_price_type WHERE id = ? AND deleted_at IS NULL';
    db.query(query, [id], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE item_price_type SET name = ?, updated_at = NOW()
                   WHERE id = ? AND deleted_at IS NULL`;
    const values = [data.name, id];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE item_price_type SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }
}

module.exports = ItemPriceType;