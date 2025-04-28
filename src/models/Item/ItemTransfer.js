const db = require('../../config/db');

class ItemTransfer {
  static create(data, callback) {
    const query = `INSERT INTO item_transfer (item_id, from_warehouse_id, to_warehouse_id, quantity, employee_id, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const values = [data.item_id, data.from_warehouse_id, data.to_warehouse_id, data.quantity, data.employee_id, data.note];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = `SELECT * FROM item_transfer WHERE deleted_at IS NULL`;
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = `SELECT * FROM item_transfer WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [id], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE item_transfer SET item_id = ?, from_warehouse_id = ?, to_warehouse_id = ?, quantity = ?, employee_id = ?, note = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`;
    const values = [data.item_id, data.from_warehouse_id, data.to_warehouse_id, data.quantity, data.employee_id, data.note, id];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE item_transfer SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }

  static getByFilters(filters, callback) {
    let query = `SELECT * FROM item_transfer WHERE deleted_at IS NULL`;
    const values = [];

    if (filters.from_warehouse_id) {
      query += ` AND from_warehouse_id = ?`;
      values.push(filters.from_warehouse_id);
    }
    if (filters.to_warehouse_id) {
      query += ` AND to_warehouse_id = ?`;
      values.push(filters.to_warehouse_id);
    }
    if (filters.item_id) {
      query += ` AND item_id = ?`;
      values.push(filters.item_id);
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


  



}

module.exports = ItemTransfer;