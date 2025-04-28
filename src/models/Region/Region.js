const db = require('../../config/db');

class Region {
  static create(data, callback) {
    const query = `INSERT INTO region (name, city_id, zone_id, employee_id, type, sales_target, description, state, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const values = [data.name, data.city_id, data.zone_id, data.employee_id, data.type, data.sales_target, data.description, data.state];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = 'SELECT * FROM region WHERE deleted_at IS NULL';
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = 'SELECT * FROM region WHERE id = ? AND deleted_at IS NULL';
    db.query(query, [id], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE region SET name = ?, city_id = ?, zone_id = ?, employee_id = ?, type = ?, sales_target = ?, description = ?, state = ?, updated_at = NOW()
                   WHERE id = ? AND deleted_at IS NULL`;
    const values = [data.name, data.city_id, data.zone_id, data.employee_id, data.type, data.sales_target, data.description, data.state, id];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE region SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }
}

module.exports = Region;