const db = require('../../config/db');

class Expense {
  static create(data, callback) {
    const query = `INSERT INTO expenses (employee_id, category_id, name, amount, note, branch_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [data.employee_id, data.category_id, data.name, data.amount, data.note, data.branch_id, data.user_id];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = `SELECT * FROM expenses WHERE deleted_at IS NULL`;
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = `SELECT * FROM expenses WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [id], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE expenses SET employee_id = ?, category_id = ?, name = ?, amount = ?, note = ?, branch_id = ?, user_id = ? WHERE id = ? AND deleted_at IS NULL`;
    const values = [data.employee_id, data.category_id, data.name, data.amount, data.note, data.branch_id, data.user_id, id];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE expenses SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }


  static getByFilters(filters, callback) {
    let query = `SELECT * FROM expenses WHERE deleted_at IS NULL`;
    const values = [];

    if (filters.id) {
      query += ` AND id = ?`;
      values.push(filters.id);
    } else {
      if (filters.startDate && filters.endDate) {
        query += ` AND created_at BETWEEN ? AND ?`;
        values.push(filters.startDate, filters.endDate);
      }
      if (filters.category_id) {
        query += ` AND category_id = ?`;
        values.push(filters.category_id);
      }
      if (filters.name) {
        query += ` AND name LIKE ?`;
        values.push(`%${filters.name}%`);
      }
      if (filters.note) {
        query += ` AND note LIKE ?`;
        values.push(`%${filters.note}%`);
      }
      if (filters.employee_id) {
        query += ` AND employee_id = ?`;
        values.push(filters.employee_id);
      }
    }

    db.query(query, values, callback);
  }


}

module.exports = Expense;