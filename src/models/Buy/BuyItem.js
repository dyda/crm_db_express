const db = require('../../config/db');

class BuyItem {
  // Create a new buy item
  static create(data, callback) {
    const query = `
      INSERT INTO buy_item (buy_invoice_id, item_id, item_unit_id, base_quantity, quantity, unit_price, total_amount, note, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
    const values = [
      data.buy_invoice_id,
      data.item_id,
      data.item_unit_id,
      data.base_quantity,
      data.quantity,
      data.unit_price,
      data.total_amount,
      data.note,
    ];
    db.query(query, values, callback);
  }

  // Get all buy items
  static getAll(callback) {
    const query = `
      SELECT bi.*, i.name AS item_name, iu.name AS unit_name
      FROM buy_item bi
      LEFT JOIN item i ON bi.item_id = i.id
      LEFT JOIN item_unit iu ON bi.item_unit_id = iu.id
      WHERE bi.deleted_at IS NULL`;
    db.query(query, callback);
  }

  // Get a buy item by ID
  static getById(id, callback) {
    const query = `
      SELECT bi.*, i.name AS item_name, iu.name AS unit_name
      FROM buy_item bi
      LEFT JOIN item i ON bi.item_id = i.id
      LEFT JOIN item_unit iu ON bi.item_unit_id = iu.id
      WHERE bi.id = ? AND bi.deleted_at IS NULL`;
    db.query(query, [id], callback);
  }

  // Update a buy item
  static update(id, data, callback) {
    const query = `
      UPDATE buy_item
      SET buy_invoice_id = ?, item_id = ?, item_unit_id = ?, base_quantity = ?, quantity = ?, unit_price = ?, total_amount = ?, note = ?, updated_at = NOW()
      WHERE id = ? AND deleted_at IS NULL`;
    const values = [
      data.buy_invoice_id,
      data.item_id,
      data.item_unit_id,
      data.base_quantity,
      data.quantity,
      data.unit_price,
      data.total_amount,
      data.note,
      id,
    ];
    db.query(query, values, callback);
  }

  // Soft delete a buy item
  static deleteSoft(id, callback) {
    const query = `
      UPDATE buy_item
      SET deleted_at = NOW()
      WHERE id = ?`;
    db.query(query, [id], callback);
  }
}

module.exports = BuyItem;