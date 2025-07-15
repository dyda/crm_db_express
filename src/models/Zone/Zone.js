const db = require('../../config/db');

class Zone {
  static create(data, callback) {
    const query = `INSERT INTO zone (name, description, city_id, sales_target, created_at, updated_at)
                   VALUES (?, ?, ?, ?, NOW(), NOW())`;
    const values = [data.name, data.description, data.city_id, data.sales_target];
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

  // ...existing code...

// Add this method at the end of the class
static filter(params, callback) {
  let query = `SELECT SQL_CALC_FOUND_ROWS * FROM zone WHERE deleted_at IS NULL`;
  const values = [];

  if (params.zone_name && params.zone_name.trim() !== '') {
    query += ' AND name LIKE ?';
    values.push(`%${params.zone_name}%`);
  }
  if (params.city_id && params.city_id !== '' && !isNaN(params.city_id)) {
    query += ' AND city_id = ?';
    values.push(Number(params.city_id));
  }

  // Sorting
  let sortBy = params.sortBy || 'id';
  let sortOrder = params.sortOrder === 'asc' ? 'ASC' : 'DESC';
  const allowedSortFields = ['id', 'name', 'city_id', 'sales_target', 'created_at', 'updated_at'];
  if (!allowedSortFields.includes(sortBy)) sortBy = 'id';

  query += ` ORDER BY ${sortBy} ${sortOrder}`;

  // Pagination
  let limit = 10, offset = 0;
  if (params.pageSize) limit = parseInt(params.pageSize, 10);
  if (params.page) offset = (parseInt(params.page, 10) - 1) * limit;
  query += ` LIMIT ? OFFSET ?`;
  values.push(limit, offset);

  db.query(query, values, (err, results) => {
    if (err) return callback(err);
    db.query('SELECT FOUND_ROWS() as total', (err2, totalRows) => {
      if (err2) return callback(err2);
      callback(null, { results, total: totalRows[0].total });
    });
  });
}

  static getByName(name, callback) {
    const query = 'SELECT * FROM zone WHERE name = ? AND deleted_at IS NULL';
    db.query(query, [name], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE zone SET name = ?, description = ?, city_id = ?, sales_target = ?, updated_at = NOW()
                   WHERE id = ? AND deleted_at IS NULL`;
    const values = [data.name, data.description, data.city_id, data.sales_target, id];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE zone SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }
}

module.exports = Zone;