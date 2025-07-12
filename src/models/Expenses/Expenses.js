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
  let query = `SELECT * FROM expenses WHERE deleted_at IS NULL`;
  const values = [];

  // If searching by id, ignore all other filters except id
  if (filters.id) {
    query += ` AND id = ?`;
    values.push(filters.id);
  } else {
    // Require date range for all other filters
    if (filters.startDate && filters.endDate) {
      query += ` AND expense_date BETWEEN ? AND ?`;
      values.push(filters.startDate, filters.endDate);
    }
    // AND for other filters
    if (filters.category_id) {
      query += ` AND category_id = ?`;
      values.push(filters.category_id);
    }
    if (filters.branch_id) {
      query += ` AND branch_id = ?`;
      values.push(filters.branch_id);
    }
    if (filters.employee_id) {
      query += ` AND employee_id = ?`;
      values.push(filters.employee_id);
    }
    if (filters.currency_id) {
      query += ` AND currency_id = ?`;
      values.push(filters.currency_id);
    }

    // OR for name/note
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

  db.query(query, values, callback);
}

}

module.exports = Expense;