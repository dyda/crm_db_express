const db = require('../../config/db');

const CustomerPayment = {
  
  create: (data, callback) => {
    const query = `INSERT INTO payment (customer_id, type, loan, amount, discount_type, discount_value, discount_result, result, employee_id,branch_id, note, created_at) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [data.customer_id, data.type, data.loan, data.amount, data.discount_type, data.discount_value, data.discount_result, data.result, data.employee_id,data.branch_id, data.note, data.created_at];
    db.query(query, values, callback);
  },
  findById: (id, callback) => {
    const query = `SELECT * FROM payment WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [id], callback);
  },
  update: (id, data, callback) => {
    const query = `UPDATE payment SET customer_id = ?, type = ?, loan = ?, amount = ?, discount_type = ?, discount_value = ?, discount_result = ?, result = ?, employee_id = ?,branch_id=?, note = ?, created_at = ? WHERE id = ? AND deleted_at IS NULL`;
    const values = [data.customer_id, data.type, data.loan, data.amount, data.discount_type, data.discount_value, data.discount_result, data.result, data.employee_id,data.branch_id, data.note, data.created_at, id];
    db.query(query, values, callback);
  },
  // delete: (id, callback) => {
  //   const query = `DELETE FROM payment WHERE id = ?`;
  //   db.query(query, [id], callback);
  // },
  deleteSoft: (id, callback) => {
    const query = `UPDATE payment SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  },
  getAll: (callback) => {
    const query = `SELECT * FROM payment WHERE deleted_at IS NULL`;
    db.query(query, callback);
  },
  getByDateRange: (startDate, endDate, customerId, callback) => {
    let query = `SELECT * FROM payment WHERE deleted_at IS NULL AND created_at BETWEEN ? AND ?`;
    const values = [startDate, endDate];

    if (customerId) {
      query += ` AND customer_id = ?`;
      values.push(customerId);
    }

    db.query(query, values, callback);
  }
};

module.exports = CustomerPayment;