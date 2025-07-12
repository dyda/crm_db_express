const db = require('../../config/db');

class Expense {
  static create(data, callback) {
    const query = `INSERT INTO expenses (employee_id, category_id, name, amount, note, branch_id, user_id, expense_date, currency_id, exchange_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      data.employee_id,
      data.category_id,
      data.name,
      data.amount,
      data.note,
      data.branch_id,
      data.user_id,
      data.expense_date,
      data.currency_id,
      data.exchange_rate,
    ];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = `SELECT * FROM expenses WHERE deleted_at IS NULL ORDER BY id DESC`;
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = `SELECT * FROM expenses WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [id], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE expenses SET employee_id = ?, category_id = ?, name = ?, amount = ?, note = ?, branch_id = ?, user_id = ?, expense_date = ?, currency_id = ?, exchange_rate = ? WHERE id = ? AND deleted_at IS NULL`;
    const values = [
      data.employee_id,
      data.category_id,
      data.name,
      data.amount,
      data.note,
      data.branch_id,
      data.user_id,
      data.expense_date,
      data.currency_id,
      data.exchange_rate,
      id,
    ];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE expenses SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }

static getByFilters(filters, callback) {
  let query = `SELECT SQL_CALC_FOUND_ROWS * FROM expenses WHERE deleted_at IS NULL`;
  const values = [];

  // ...existing filter logic...
  // Filter by id (if present, ignore other filters)
  if (filters.id) {
    query += ` AND id = ?`;
    values.push(filters.id);
  } else {
    // Date range filter
    if (filters.startDate && filters.endDate) {
      query += ` AND expense_date BETWEEN ? AND ?`;
      values.push(filters.startDate, filters.endDate);
    }
    // Category filter
    if (filters.category_id) {
      query += ` AND category_id = ?`;
      values.push(filters.category_id);
    }
    // Branch filter
    if (filters.branch_id) {
      query += ` AND branch_id = ?`;
      values.push(filters.branch_id);
    }
    // Employee filter
    if (filters.employee_id) {
      query += ` AND employee_id = ?`;
      values.push(filters.employee_id);
    }
    // Currency filter
    if (filters.currency_id) {
      query += ` AND currency_id = ?`;
      values.push(filters.currency_id);
    }
    // Name or note search (OR logic)
    const orConditions = [];
    const orValues = [];
    if (filters.name) {
      orConditions.push(`name LIKE ?`);
      orValues.push(`%${filters.name}%`);
    }
    if (filters.note) {
      orConditions.push(`note LIKE ?`);
      orValues.push(`%${filters.note}%`);
    }
    if (orConditions.length > 0) {
      query += ` AND (${orConditions.join(' OR ')})`;
      values.push(...orValues);
    }
  }

  // Sorting
  let sortBy = filters.sortBy || 'id';
  let sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';

  // Whitelist allowed columns to prevent SQL injection
  const allowedSortFields = [
    'id', 'expense_date', 'amount', 'name', 'category_id', 'employee_id', 'branch_id', 'currency_id'
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

}

module.exports = Expense;