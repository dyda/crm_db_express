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
  static filter(filters, callback) {
    let query = `
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
  
    const conditions = [];
    const values = [];
  
    // Add filters dynamically
    if (filters.region_id) {
      conditions.push(`region.id = ?`);
      values.push(filters.region_id);
    }
  
    if (filters.region_name) {
      conditions.push(`region.name LIKE ?`);
      values.push(`%${filters.region_name}%`);
    }
  
    if (filters.city_name) {
      conditions.push(`city.name LIKE ?`);
      values.push(`%${filters.city_name}%`);
    }
  
    if (filters.zone_name) {
      conditions.push(`zone.name LIKE ?`);
      values.push(`%${filters.zone_name}%`);
    }
  
    if (filters.user_name) {
      conditions.push(`users.name LIKE ?`);
      values.push(`%${filters.user_name}%`);
    }
  
    // Append conditions to the query
    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' || ');
    }
  
    // Debugging logs
   // console.log('Generated Query:', query);
   // console.log('Query Values:', values);
  
    db.query(query, values, callback);
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