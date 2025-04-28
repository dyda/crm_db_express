const db = require('../../config/db');

class ItemTransaction {
  static create(data, callback) {
    const query = `INSERT INTO item_transaction (type, warehouse_id, item_id, quantity, employee_id, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const values = [data.type, data.warehouse_id, data.item_id, data.quantity, data.employee_id, data.note];
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
    const values = [];

    if (filters.warehouse_id) {
      query += ` AND warehouse_id = ?`;
      values.push(filters.warehouse_id);
    }
    if (filters.item_id) {
      query += ` AND item_id = ?`;
      values.push(filters.item_id);
    }
    if (filters.type) {
      query += ` AND type = ?`;
      values.push(filters.type);
    }
    if (filters.employee_id) {
      query += ` AND employee_id = ?`;
      values.push(filters.employee_id);
    }
    if (filters.startDate && filters.endDate) {
      query += ` AND created_at BETWEEN ? AND ?`;
      values.push(filters.startDate, filters.endDate);
    }

    db.query(query, values, callback);
  } 
  

  static update(id, data, callback) {
    const query = `UPDATE item_transaction SET type = ?, warehouse_id = ?, item_id = ?, quantity = ?, employee_id = ?, note = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`;
    const values = [data.type, data.warehouse_id, data.item_id, data.quantity, data.employee_id, data.note, id];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE item_transaction SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }





}

module.exports = ItemTransaction;