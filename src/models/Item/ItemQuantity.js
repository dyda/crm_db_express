const db = require('../../config/db');

class ItemQuantity {
  static create(data, callback) {
    const query = `INSERT INTO item_quantity (warehouse_id, item_id, quantity_start, quantity, created_at, updated_at)
                   VALUES (?, ?, ?, ?, NOW(), NOW())`;
    const values = [data.warehouse_id, data.item_id, data.quantity_start, data.quantity];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = 'SELECT * FROM item_quantity WHERE deleted_at IS NULL';
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = 'SELECT * FROM item_quantity WHERE id = ? AND deleted_at IS NULL';
    db.query(query, [id], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE item_quantity SET warehouse_id = ?, item_id = ?, quantity_start = ?, quantity = ?, updated_at = NOW()
                   WHERE id = ? AND deleted_at IS NULL`;
    const values = [data.warehouse_id, data.item_id, data.quantity_start, data.quantity, id];
    db.query(query, values, callback);
  }

static exists(warehouse_id, item_id, callback) {
    const query = 'SELECT 1 FROM item_quantity WHERE warehouse_id = ? AND item_id = ? AND deleted_at IS NULL LIMIT 1';
    db.query(query, [warehouse_id, item_id], (err, rows) => {
      if (err) return callback(err, false);
      callback(null, rows && rows.length > 0);
    });
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE item_quantity SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }

  static increaseQuantity(warehouse_id, item_id, amount, callback) {
    const query = `
      UPDATE item_quantity iq
      JOIN item i ON iq.item_id = i.id
      SET iq.quantity = iq.quantity + ?, iq.updated_at = NOW()
      WHERE iq.warehouse_id = ? AND iq.item_id = ? AND iq.deleted_at IS NULL AND (i.allow_zero_sell = 1 OR iq.quantity + ? > 0)`;
    const values = [amount, warehouse_id, item_id, amount];
    db.query(query, values, callback);
  }

  static decreaseQuantity(warehouse_id, item_id, amount, callback) {
    const query = `
      UPDATE item_quantity iq
      JOIN item i ON iq.item_id = i.id
      SET iq.quantity = iq.quantity - ?, iq.updated_at = NOW()
      WHERE iq.warehouse_id = ? AND iq.item_id = ? AND iq.deleted_at IS NULL AND (i.allow_zero_sell = 1 OR iq.quantity - ? > 0)
    `;
    const values = [amount, warehouse_id, item_id, amount];
    db.query(query, values, callback);
  }

  static getByWarehouseAndItem(warehouse_id, item_id, callback) {
    const query = 'SELECT * FROM item_quantity WHERE warehouse_id = ? AND item_id = ? AND deleted_at IS NULL';
    db.query(query, [warehouse_id, item_id], callback);
  }

  



}

module.exports = ItemQuantity;