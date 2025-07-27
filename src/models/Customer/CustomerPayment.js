const db = require('../../config/db');

const CustomerPayment = {
  
  create: (data, callback) => {
  const query = `INSERT INTO payment (
    customer_id, type, loan, amount, discount_type, discount_value, discount_result, result,
    employee_id, branch_id, note, created_at, payment_date,
    currency_id, exchange_rate, reference_number, payment_method, user_id
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [
    data.customer_id, data.type, data.loan, data.amount, data.discount_type, data.discount_value, data.discount_result, data.result,
    data.employee_id, data.branch_id, data.note, data.created_at, data.payment_date,
    data.currency_id, data.exchange_rate, data.reference_number, data.payment_method, data.user_id
  ];
  db.query(query, values, callback);
},
  getById: (id, callback) => {
    const query = `SELECT * FROM payment WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [id], callback);
  },
  filter: (filters, callback) => {
    let query = `SELECT * FROM payment WHERE deleted_at IS NULL AND created_at BETWEEN ? AND ?`;
    const params = [filters.startDate, filters.endDate];

    if (filters.customer_id) {
      query += ` AND customer_id = ?`;
      params.push(filters.customer_id);
    }
    if (filters.employee_id) {
      query += ` AND employee_id = ?`;
      params.push(filters.employee_id);
    }
    if (filters.branch_id) {
      query += ` AND branch_id = ?`;
      params.push(filters.branch_id);
    }
    if (filters.currency_id) {
      query += ` AND currency_id = ?`;
      params.push(filters.currency_id);
    }
    if (filters.payment_method) {
      query += ` AND payment_method = ?`;
      params.push(filters.payment_method);
    }
    if (filters.type) {
      query += ` AND type = ?`;
      params.push(filters.type);
    }
    if (filters.reference_number) {
      query += ` AND reference_number = ?`;
      params.push(filters.reference_number);
    }
    if (filters.user_id) {
      query += ` AND user_id = ?`;
      params.push(filters.user_id);
    }

    // Add sorting if needed
    if (filters.sortBy) {
      query += ` ORDER BY ${filters.sortBy} ${filters.sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
    }

    // Add pagination if needed
    if (filters.page && filters.pageSize) {
      const offset = (filters.page - 1) * filters.pageSize;
      query += ` LIMIT ? OFFSET ?`;
      params.push(Number(filters.pageSize), Number(offset));
    }

    db.query(query, params, callback);
  },
update: (id, data, callback) => {
  const query = `UPDATE payment SET
    customer_id = ?, type = ?, loan = ?, amount = ?, discount_type = ?, discount_value = ?, discount_result = ?, result = ?,
    employee_id = ?, branch_id = ?, note = ?, created_at = ?, payment_date = ?,
    currency_id = ?, exchange_rate = ?, reference_number = ?, payment_method = ?, user_id = ?
    WHERE id = ? AND deleted_at IS NULL`;
  const values = [
    data.customer_id, data.type, data.loan, data.amount, data.discount_type, data.discount_value, data.discount_result, data.result,
    data.employee_id, data.branch_id, data.note, data.created_at, data.payment_date,
    data.currency_id, data.exchange_rate, data.reference_number, data.payment_method, data.user_id,
    id
  ];
  db.query(query, values, callback);
},
  deleteSoft: (id, callback) => {
    const query = `UPDATE payment SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  },
  getAll: (callback) => {
    const query = `SELECT * FROM payment WHERE deleted_at IS NULL`;
    db.query(query, callback);
  },
};

module.exports = CustomerPayment;