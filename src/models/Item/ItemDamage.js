const db = require('../../config/db');

class ItemDamage {
  static create(data, callback) {
    const query = `
      INSERT INTO item_damage 
        (warehouse_id, item_id, unit_id, quantity, type, reason, date_at, user_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const values = [
      data.warehouse_id,
      data.item_id,
      data.unit_id,
      data.quantity,
      data.type,
      data.reason,
      data.date_at,
      data.user_id
    ];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = `
      SELECT * FROM item_damage 
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `;
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = `
      SELECT * FROM item_damage 
      WHERE id = ? AND deleted_at IS NULL
    `;
    db.query(query, [id], callback);
  }

  // Modern filter with sort and pagination
  static getByFilters(filters, callback) {
    let query = `SELECT SQL_CALC_FOUND_ROWS * FROM item_damage WHERE deleted_at IS NULL`;
    const values = [];

    // Filtering
    if (filters.warehouse_id) {
      query += ` AND warehouse_id = ?`;
      values.push(filters.warehouse_id);
    }
    if (filters.item_id) {
      query += ` AND item_id = ?`;
      values.push(filters.item_id);
    }
    if (filters.unit_id) {
      query += ` AND unit_id = ?`;
      values.push(filters.unit_id);
    }
    if (filters.type) {
      query += ` AND type = ?`;
      values.push(filters.type);
    }
    if (filters.user_id) {
      query += ` AND user_id = ?`;
      values.push(filters.user_id);
    }

    // Always filter by date_at range (default: all time if not provided)
    if (filters.date_from && filters.date_to) {
      query += ` AND date_at BETWEEN ? AND ?`;
      values.push(filters.date_from, filters.date_to);
    }

    // Sorting
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortBy} ${sortOrder}`;

    // Pagination
    const page = parseInt(filters.page, 10) || 1;
    const pageSize = parseInt(filters.pageSize, 10) || 20;
    const offset = (page - 1) * pageSize;
    query += ` LIMIT ? OFFSET ?`;
    values.push(pageSize, offset);

    db.query(query, values, (err, rows) => {
      if (err) return callback(err);
      // Get total count for pagination
      db.query('SELECT FOUND_ROWS() as total', (err2, totalRows) => {
        if (err2) return callback(err2);
        callback(null, { data: rows, total: totalRows[0].total });
      });
    });
  } 


  static update(id, data, callback) {
    const query = `
      UPDATE item_damage SET 
        warehouse_id = ?, item_id = ?, unit_id = ?, quantity = ?, type = ?, reason = ?, date_at = ?, user_id = ?, updated_at = NOW()
      WHERE id = ? AND deleted_at IS NULL
    `;
    const values = [
      data.warehouse_id,
      data.item_id,
      data.unit_id,
      data.quantity,
      data.type,
      data.reason,
      data.date_at,
      data.user_id,
      id
    ];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE item_damage SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }
}

module.exports = ItemDamage;