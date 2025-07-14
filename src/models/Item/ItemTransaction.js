const db = require('../../config/db');

class ItemTransaction {
  static create(data, callback) {
    const query = `INSERT INTO item_transaction (type, warehouse_id, item_id, unit_id, quantity, employee_id, note, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const values = [data.type, data.warehouse_id, data.item_id, data.unit_id, data.quantity, data.employee_id, data.note];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = `SELECT * FROM item_transaction WHERE deleted_at IS NULL`;
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = `SELECT * FROM item_transaction WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [id], callback);
  }
  
  
static getByFilters(filters, callback) {
  let query = `SELECT * FROM item_transaction WHERE deleted_at IS NULL`;
  let countQuery = `SELECT COUNT(*) as total FROM item_transaction WHERE deleted_at IS NULL`;
  const values = [];
  const countValues = [];

  function addFilter(sql, arr, field, filterArr) {
    if (filterArr && filterArr.length > 0) {
      sql += ` AND ${field} IN (${filterArr.map(() => '?').join(',')})`;
      arr.push(...filterArr);
    }
    return sql;
  }

  query = addFilter(query, values, 'warehouse_id', filters.warehouse_ids);
  countQuery = addFilter(countQuery, countValues, 'warehouse_id', filters.warehouse_ids);

  query = addFilter(query, values, 'item_id', filters.item_ids);
  countQuery = addFilter(countQuery, countValues, 'item_id', filters.item_ids);

  query = addFilter(query, values, 'type', filters.types);
  countQuery = addFilter(countQuery, countValues, 'type', filters.types);

  query = addFilter(query, values, 'employee_id', filters.employee_ids);
  countQuery = addFilter(countQuery, countValues, 'employee_id', filters.employee_ids);

    // Add category and branch if you have those columns
    if (filters.category_ids && filters.category_ids.length > 0) {
      query += ` AND category_id IN (${filters.category_ids.map(() => '?').join(',')})`;
      countQuery += ` AND category_id IN (${filters.category_ids.map(() => '?').join(',')})`;
      values.push(...filters.category_ids);
      countValues.push(...filters.category_ids);
    }
    if (filters.branch_ids && filters.branch_ids.length > 0) {
      query += ` AND branch_id IN (${filters.branch_ids.map(() => '?').join(',')})`;
      countQuery += ` AND branch_id IN (${filters.branch_ids.map(() => '?').join(',')})`;
      values.push(...filters.branch_ids);
      countValues.push(...filters.branch_ids);
    }

    if (filters.startDate && filters.endDate) {
      query += ` AND DATE(created_at) BETWEEN ? AND ?`;
      countQuery += ` AND DATE(created_at) BETWEEN ? AND ?`;
      values.push(filters.startDate, filters.endDate);
      countValues.push(filters.startDate, filters.endDate);
    }

    if (filters.search && filters.search.trim() !== '') {
      query += ` AND (note LIKE ? OR quantity LIKE ?)`;
      countQuery += ` AND (note LIKE ? OR quantity LIKE ?)`;
      values.push(`%${filters.search}%`, `%${filters.search}%`);
      countValues.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    // Sorting
    if (filters.sortBy) {
      query += ` ORDER BY ${filters.sortBy} ${filters.sortOrder === 'asc' ? 'ASC' : 'DESC'}`;
    } else {
      query += ` ORDER BY created_at DESC`;
    }

    // Pagination
    if (filters.page && filters.pageSize) {
      const offset = (parseInt(filters.page) - 1) * parseInt(filters.pageSize);
      query += ` LIMIT ? OFFSET ?`;
      values.push(parseInt(filters.pageSize), offset);
    }

    // Get total count first, then data
    db.query(countQuery, countValues, (err, countResult) => {
      if (err) return callback(err);
      const total = countResult[0]?.total || 0;
      db.query(query, values, (err, results) => {
        if (err) return callback(err);
        callback(null, results, total);
      });
    });
  }
  

   static update(id, data, callback) {
    const query = `UPDATE item_transaction SET type = ?, warehouse_id = ?, item_id = ?, unit_id = ?, quantity = ?, employee_id = ?, note = ?, updated_at = NOW()
                   WHERE id = ? AND deleted_at IS NULL`;
    const values = [data.type, data.warehouse_id, data.item_id, data.unit_id, data.quantity, data.employee_id, data.note, id];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE item_transaction SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }

}

module.exports = ItemTransaction;