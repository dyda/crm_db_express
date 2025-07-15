const db = require('../../config/db');

class Region {
  // Create a new region
  static create(data, callback) {
    const query = `
      INSERT INTO region (name, city_id, zone_id, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;
    const values = [
      data.name,
      data.city_id,
      data.zone_id,
      data.description
    ];
    db.query(query, values, callback);
  }

  // Get all regions (not deleted)
  static getAll(callback) {
    const query = `
      SELECT id, name, city_id, zone_id, description, created_at, updated_at, deleted_at
      FROM region
      WHERE deleted_at IS NULL
    `;

       

    db.query(query, callback);
  }

  // Get region by id
  static getById(id, callback) {
    const query = `
      SELECT id, name, city_id, zone_id, description, created_at, updated_at, deleted_at
      FROM region
      WHERE id = ? AND deleted_at IS NULL
    `;
    db.query(query, [id], callback);
  }

  // Update region
  static update(id, data, callback) {
    const query = `
      UPDATE region
      SET name = ?, city_id = ?, zone_id = ?, description = ?, updated_at = NOW()
      WHERE id = ? AND deleted_at IS NULL
    `;
    const values = [
      data.name,
      data.city_id,
      data.zone_id,
      data.description,
      id
    ];
    db.query(query, values, callback);
  }

  // Soft delete region
  static deleteSoft(id, callback) {
    const query = `
      UPDATE region
      SET deleted_at = NOW()
      WHERE id = ?
    `;
    db.query(query, [id], callback);
  }

  // Modern filter function
static filter(params, callback) {
  let query = `SELECT SQL_CALC_FOUND_ROWS id, name, city_id, zone_id, description, created_at, updated_at, deleted_at FROM region WHERE deleted_at IS NULL`;
  

  const values = [];

   if (params.id !== undefined && params.id !== null && params.id !== '') {
    query += ' AND id = ?';
    values.push(Number(params.id));
  }

  if (params.region_name && params.region_name.trim() !== '') {
    query += ' AND name LIKE ?';
    values.push(`%${params.region_name}%`);
  }
  if (params.city_id && params.city_id !== '' && !isNaN(params.city_id)) {
    query += ' AND city_id = ?';
    values.push(Number(params.city_id));
  }
  if (params.zone_id && params.zone_id !== '' && !isNaN(params.zone_id)) {
    query += ' AND zone_id = ?';
    values.push(Number(params.zone_id));
  }

  // Sorting
  let sortBy = params.sortBy || 'id';
  let sortOrder = params.sortOrder === 'asc' ? 'ASC' : 'DESC';
  const allowedSortFields = ['id', 'name', 'city_id', 'zone_id', 'created_at', 'updated_at'];
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
}

module.exports = Region;