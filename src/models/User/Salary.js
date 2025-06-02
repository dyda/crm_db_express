const db = require('../../config/db');

class Salary {
   static create(data, callback) {
    const query = `INSERT INTO salary (employee_id, amount, salary_period_start, salary_period_end, note, user_id, branch_id, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const values = [
      data.employee_id,
      data.amount,
      data.salary_period_start,
      data.salary_period_end,
      data.note,
      data.user_id,
      data.branch_id
    ];
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

static filterByParams(startDate, endDate, employeeId, branch_id, callback) {
  // Require both dates
  if (!startDate || !endDate) {
    return callback(new Error("Both startDate and endDate are required for filtering."));
  }

  let query = `
    SELECT s.*, b.name AS branch_name, b.id AS branch_id, u.name AS employee_name
    FROM salary s
    LEFT JOIN branch b ON s.branch_id = b.id
    LEFT JOIN users u ON s.employee_id = u.id
    WHERE s.deleted_at IS NULL
      AND DATE(s.created_at) BETWEEN ? AND ?
  `;

  const values = [startDate, endDate];

  if (employeeId) {
    query += ' AND s.employee_id = ?';
    values.push(employeeId);
  }

  if (branch_id) {
    query += ' AND s.branch_id = ?';
    values.push(branch_id);
  }
  query += ' ORDER BY s.created_at DESC';

  // // Helper to inject values into query for logging
  // function injectValues(sql, vals) {
  //   let i = 0;
  //   return sql.replace(/\?/g, () => {
  //     const val = vals[i++];
  //     if (typeof val === 'string') return `'${val}'`;
  //     if (val === null || val === undefined) return 'NULL';
  //     return val;
  //   });
  // }
  db.query(query, values, callback);

  // console.log('Executing query:', injectValues(query, values));
}

    static update(id, data, callback) {
    const query = `UPDATE salary SET employee_id = ?, amount = ?, salary_period_start = ?, salary_period_end = ?, note = ?, user_id = ?, branch_id = ?, updated_at = NOW()
                   WHERE id = ? AND deleted_at IS NULL`;
}

    static update(id, data, callback) {
    const query = `UPDATE salary SET employee_id = ?, amount = ?, salary_period_start = ?, salary_period_end = ?, note = ?, user_id = ?, branch_id = ?, updated_at = NOW()
                   WHERE id = ? AND deleted_at IS NULL`;
    const values = [
      data.employee_id,
      data.amount,
      data.salary_period_start,
      data.salary_period_end,
      data.note,
      data.user_id,
      data.branch_id,
      id
    ];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE salary SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }
}

module.exports = Salary;