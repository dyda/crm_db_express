const db = require('../../config/db');

class BuyInvoice {
  static create(data, callback) {
    const query = `INSERT INTO buy_invoice (type, invoice_number, invoice_date, total_amount, tax_amount, due_date, customer_id, branch_id, warehouse_id, employee_id, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const values = [data.type, data.invoice_number, data.invoice_date, data.total_amount, data.tax_amount, data.due_date, data.customer_id, data.branch_id, data.warehouse_id, data.employee_id, data.note];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = `SELECT * FROM buy_invoice WHERE deleted_at IS NULL`;
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = `SELECT * FROM buy_invoice WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [id], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE buy_invoice SET type = ?, invoice_number = ?, invoice_date = ?, total_amount = ?, tax_amount = ?, due_date = ?, customer_id = ?, branch_id = ?, warehouse_id = ?, employee_id = ?, note = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`;
    const values = [data.type, data.invoice_number, data.invoice_date, data.total_amount, data.tax_amount, data.due_date, data.customer_id, data.branch_id, data.warehouse_id, data.employee_id, data.note, id];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE buy_invoice SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }

  static getByFilters(filters, callback) {
    let query = `
      SELECT bi.*, c.name AS customer_name, w.name AS warehouse_name, b.name AS branch_name
      FROM buy_invoice bi
      LEFT JOIN customer c ON bi.customer_id = c.id
      LEFT JOIN warehouse w ON bi.warehouse_id = w.id
      LEFT JOIN branch b ON bi.branch_id = b.id
      WHERE bi.deleted_at IS NULL`;
    
    const values = [];

    if (filters.startDate && filters.endDate) {
      query += ` AND invoice_date BETWEEN ? AND ?`;
      values.push(filters.startDate, filters.endDate);
    }
    if (filters.warehouse_id) {
      query += ` AND warehouse_id = ?`;
      values.push(filters.warehouse_id);
    }
    if (filters.branch_id) {
      query += ` AND branch_id = ?`;
      values.push(filters.branch_id);
    }
    if (filters.customer_id) {
      query += ` AND customer_id = ?`;
      values.push(filters.customer_id);
    }
    if (filters.invoice_number) {
      query += ` AND invoice_number = ?`;
      values.push(filters.invoice_number);
    }
    if (filters.type) {
      query += ` AND type = ?`;
      values.push(filters.type);
    }
    if (filters.invoice_date) {
      query += ` AND invoice_date = ?`;
      values.push(filters.invoice_date);
    }


    db.query(query, values, callback);
  }


}

module.exports = BuyInvoice;