const db = require('../../config/db');

class Region {
  static create(data, callback) {
    const query = `INSERT INTO region (name, city_id, zone_id, user_id, type, sales_target, description, state, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const values = [data.name, data.city_id, data.zone_id, data.user_id, data.type, data.sales_target, data.description, data.state];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = `
      SELECT region.*, 
             city.name AS city_name, 
             zone.name AS zone_name, 
             users.name AS user_name
      FROM region
      LEFT JOIN city ON region.city_id = city.id
      LEFT JOIN zone ON region.zone_id = zone.id
      LEFT JOIN users ON region.user_id = users.id
      WHERE region.deleted_at IS NULL
    `;
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = `
      SELECT region.*, 
             city.name AS city_name, 
             zone.name AS zone_name, 
             employee.name AS user_name
      FROM region
      LEFT JOIN city ON region.city_id = city.id
      LEFT JOIN zone ON region.zone_id = zone.id
      LEFT JOIN users ON region.user_id = users.id
      WHERE region.id = ? AND region.deleted_at IS NULL
    `;
    db.query(query, [id], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE region SET name = ?, city_id = ?, zone_id = ?, user_id = ?, type = ?, sales_target = ?, description = ?, state = ?, updated_at = NOW()
                   WHERE id = ? AND deleted_at IS NULL`;
    const values = [data.name, data.city_id, data.zone_id, data.user_id, data.type, data.sales_target, data.description, data.state, id];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE region SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }
}

module.exports = Region;