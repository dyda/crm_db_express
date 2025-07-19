const db = require('../../config/db');

class ItemTransfer {
  static create(data, callback) {
    const query = `INSERT INTO item_transfer (item_id, from_warehouse_id, to_warehouse_id, unit_id, quantity, employee_id, note, transfer_date, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const values = [
      data.item_id,
      data.from_warehouse_id,
      data.to_warehouse_id,
      data.unit_id,
      data.quantity,
      data.employee_id,
      data.note,
      data.transfer_date
    ];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = `SELECT * FROM item_transfer WHERE deleted_at IS NULL`;
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = `SELECT * FROM item_transfer WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [id], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE item_transfer SET item_id = ?, from_warehouse_id = ?, to_warehouse_id = ?, unit_id = ?, quantity = ?, employee_id = ?, note = ?, transfer_date = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`;
    const values = [
      data.item_id,
      data.from_warehouse_id,
      data.to_warehouse_id,
      data.unit_id,
      data.quantity,
      data.employee_id,
      data.note,
      data.transfer_date,
      id
    ];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE item_transfer SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }

  static getByFilters(filters, callback) {
    let where = 'WHERE deleted_at IS NULL';
    const params = [];

    if (filters.from_warehouse_id) {
      where += ' AND from_warehouse_id = ?';
      params.push(filters.from_warehouse_id);
    }
    if (filters.to_warehouse_id) {
      where += ' AND to_warehouse_id = ?';
      params.push(filters.to_warehouse_id);
    }
    if (filters.item_id) {
      where += ' AND item_id = ?';
      params.push(filters.item_id);
    }
    if (filters.unit_id) {
      where += ' AND unit_id = ?';
      params.push(filters.unit_id);
    }
    if (filters.employee_id) {
      where += ' AND employee_id = ?';
      params.push(filters.employee_id);
    }
    // Filter between two transfer_date range
    if (filters.startDate && filters.endDate) {
      where += ' AND transfer_date BETWEEN ? AND ?';
      params.push(filters.startDate, filters.endDate);
    }

    // Sorting
    const allowedSortFields = [
      'id', 'item_id', 'from_warehouse_id', 'to_warehouse_id', 'unit_id', 'quantity', 'employee_id', 'transfer_date', 'created_at', 'updated_at'
    ];
    let sortBy = filters.sortBy || 'id';
    if (!allowedSortFields.includes(sortBy)) sortBy = 'id';
    const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';

    // Pagination
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    const query = `
      SELECT id, item_id, from_warehouse_id, to_warehouse_id, unit_id, quantity, employee_id, note, transfer_date, created_at, updated_at, deleted_at
      FROM item_transfer
      ${where}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;
    db.query(query, [...params, limit, offset], (err, rows) => {
      if (err) return callback(err);
      const countQuery = `SELECT COUNT(*) as total FROM item_transfer ${where}`;
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
}

module.exports = ItemTransfer;