const db = require('../../config/db');

class Serial {
  static create(data, callback) {
    const query = `
      INSERT INTO serial (type, name, note, date_at, branch_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(query, [data.type, data.name, data.note, data.date_at, data.branch_id], callback);
  }

  
  static getAll(callback) {
    const query = `
      SELECT id, type, name, note, date_at, created_at, updated_at, branch_id
      FROM serial
      WHERE deleted_at IS NULL
      ORDER BY id DESC
    `;
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = `
      SELECT id, type, name, note, date_at, created_at, updated_at, branch_id
      FROM serial
      WHERE id = ? AND deleted_at IS NULL
      LIMIT 1
    `;
    db.query(query, [id], (err, rows) => {
      if (err) return callback(err);
      callback(null, rows[0]);
    });
  }

   static getByFilters(filters, callback) {
  let where = 'WHERE deleted_at IS NULL';
  const params = [];

  if (filters.branch_id) {
    where += ' AND branch_id = ?';
    params.push(filters.branch_id);
  }
  if (filters.type) {
    where += ' AND type = ?';
    params.push(filters.type);
  }
  if (filters.name) {
    where += ' AND name LIKE ?';
    params.push(`%${filters.name}%`);
  }
  if (filters.startDate && filters.endDate) {
    where += ` AND date_at BETWEEN ? AND ?`;
    params.push(filters.startDate, filters.endDate);
  }

    // Whitelist allowed sort fields
    const allowedSortFields = ['id', 'type', 'name', 'date_at','branch_id', 'created_at', 'updated_at'];
    let sortBy = filters.sortBy || 'id';
    if (!allowedSortFields.includes(sortBy)) sortBy = 'id';
    const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';

    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    
    
  const query = `
    SELECT id, type, name, note, date_at, created_at, updated_at, branch_id
    FROM serial
    ${where}
    ORDER BY ${sortBy} ${sortOrder}
    LIMIT ? OFFSET ?
  `;
    db.query(query, [...params, limit, offset], (err, rows) => {
    if (err) return callback(err);
    const countQuery = `SELECT COUNT(*) as total FROM serial ${where}`;
    db.query(countQuery, params, (err2, countRows) => {
      if (err2) return callback(err2);
      callback(null, {
        data: rows,
        total: countRows[0]?.total || 0,
        page,
        pageSize,
      });
    });
  });
  }


    static update(id, data, callback) {
    const query = `
      UPDATE serial
      SET type = ?, name = ?, note = ?, date_at = ?, branch_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND deleted_at IS NULL
    `;
    db.query(query, [data.type, data.name, data.note, data.date_at, data.branch_id, id], callback);
  }

  static deleteSoft(id, callback) {
    const query = `
      UPDATE serial
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    db.query(query, [id], callback);
  }
}

module.exports = Serial;