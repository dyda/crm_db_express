const db = require('../../config/db');

class Item {
  static create(data, callback) {
    const query = `INSERT INTO item (name, description, category_id, brand_id, cost, barcode, isService, image_url, allow_zero_sell)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [data.name, data.description, data.category_id, data.brand_id, data.cost, data.barcode, data.isService, data.image_url, data.allow_zero_sell];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = 'SELECT * FROM item WHERE deleted_at IS NULL';
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = 'SELECT * FROM item WHERE id = ? AND deleted_at IS NULL';
    db.query(query, [id], callback);
  }

  static getByFilters(filters, callback) {
  let query = `SELECT SQL_CALC_FOUND_ROWS * FROM item WHERE deleted_at IS NULL`;
  const values = [];

  // Filter by id (if present, ignore other filters)
  if (filters.id !== undefined && filters.id !== '') {
    query += ` AND id = ?`;
    values.push(filters.id);
  } else {
    // Category filter
    if (filters.category_id !== undefined && filters.category_id !== '') {
      query += ` AND category_id = ?`;
      values.push(filters.category_id);
    }
    // Brand filter
    if (filters.brand_id !== undefined && filters.brand_id !== '') {
      query += ` AND brand_id = ?`;
      values.push(filters.brand_id);
    }
    // Type filter (isService)
    if (filters.isService !== undefined && filters.isService !== '') {
      query += ` AND isService = ?`;
      values.push(filters.isService);
    }
    // Branch filter (if you have branch_id in item table)
    if (filters.branch_id !== undefined && filters.branch_id !== '') {
      query += ` AND branch_id = ?`;
      values.push(filters.branch_id);
    }
    // Name or barcode search (OR logic)
    const orConditions = [];
    const orValues = [];
    if (filters.name !== undefined && filters.name !== '') {
      orConditions.push(`name LIKE ?`);
      orValues.push(`%${filters.name}%`);
    }
    if (filters.barcode !== undefined && filters.barcode !== '') {
      orConditions.push(`barcode LIKE ?`);
      orValues.push(`%${filters.barcode}%`);
    }
    if (orConditions.length > 0) {
      query += ` AND (${orConditions.join(' OR ')})`;
      values.push(...orValues);
    }
  }

  // Sorting
  let sortBy = filters.sortBy || 'id';
  let sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';
  const allowedSortFields = [
    'id', 'name', 'category_id', 'brand_id', 'cost', 'barcode', 'isService', 'allow_zero_sell'
  ];
  if (!allowedSortFields.includes(sortBy)) sortBy = 'id';

  // Pagination
  let limit = 10, offset = 0;
  if (filters.pageSize) {
    limit = parseInt(filters.pageSize, 10);
  }
  if (filters.page) {
    offset = (parseInt(filters.page, 10) - 1) * limit;
  }

  query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
  values.push(limit, offset);

  db.query(query, values, (err, results) => {
    if (err) return callback(err);
    db.query('SELECT FOUND_ROWS() as total', (err2, totalRows) => {
      if (err2) return callback(err2);
      callback(null, { results, total: totalRows[0].total });
    });
  });
}

  static update(id, data, callback) {
    const query = `UPDATE item SET name = ?, description = ?, category_id = ?, brand_id = ?, cost = ?, barcode = ?,isService = ? ,allow_zero_sell = ?, image_url = ?
                   WHERE id = ? AND deleted_at IS NULL`;
    const values = [data.name, data.description, data.category_id, data.brand_id, data.cost, data.barcode,data.isService,data.allow_zero_sell, data.image_url, id];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE item SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }

}

module.exports = Item;