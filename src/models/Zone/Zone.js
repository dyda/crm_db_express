const db = require('../../config/db');

class Zone {
  static create(data, callback) {
    const query = `INSERT INTO zone (name, description, created_at, updated_at)
                   VALUES (?, ?, NOW(), NOW())`;
    const values = [data.name, data.description];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = 'SELECT * FROM zone WHERE deleted_at IS NULL';
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = 'SELECT * FROM zone WHERE id = ? AND deleted_at IS NULL';
    db.query(query, [id], callback);
  }

  static getByName(name, callback) {
    const query = 'SELECT * FROM zone WHERE name = ? AND deleted_at IS NULL';
    db.query(query, [name], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE zone SET name = ?, description = ?, updated_at = NOW()
                   WHERE id = ? AND deleted_at IS NULL`;
    const values = [data.name, data.description, id];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE zone SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }
}

module.exports = Zone;