const db = require('../../config/db');

class Salary {
  static create(data, callback) {
    const query = `INSERT INTO salary (employee_id, amount, salary_period_start, salary_period_end, note, user_id, branch_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [data.employee_id, data.amount, data.salary_period_start, data.salary_period_end, data.note, data.user_id, data.branch_id];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = `SELECT * FROM salary WHERE deleted_at IS NULL`;
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = `SELECT * FROM salary WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [id], callback);
  }

  static getByDateRange(startDate, endDate, customerId, callback) {
    let query = `SELECT * FROM salary WHERE deleted_at IS NULL AND created_at >= ? AND created_at <= ?`;
    const values = [startDate, endDate];

    if (customerId) {
      query += ` AND employee_id = ?`;
      values.push(customerId);
    }

    db.query(query, values, callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE salary SET employee_id = ?, amount = ?, salary_period_start = ?, salary_period_end = ?, note = ?, user_id = ?, branch_id = ? WHERE id = ? AND deleted_at IS NULL`;
    const values = [data.employee_id, data.amount, data.salary_period_start, data.salary_period_end, data.note, data.user_id, data.branch_id, id];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE salary SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }
}

module.exports = Salary;