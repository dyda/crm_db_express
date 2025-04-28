const db = require('../../config/db');

class ItemUnit {
  static create(data, callback) {
    const query = `INSERT INTO item_unit (name, description, conversion_factor, created_at, updated_at)
                   VALUES (?, ?, ?, NOW(), NOW())`;
    const values = [data.name, data.description, data.conversion_factor];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = 'SELECT * FROM item_unit WHERE deleted_at IS NULL';
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = 'SELECT * FROM item_unit WHERE id = ? AND deleted_at IS NULL';
    db.query(query, [id], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE item_unit SET name = ?, description = ?, conversion_factor = ?, updated_at = NOW()
                   WHERE id = ? AND deleted_at IS NULL`;
    const values = [data.name, data.description, data.conversion_factor, id];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE item_unit SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }
}

module.exports = ItemUnit;