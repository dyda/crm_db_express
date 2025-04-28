const db = require('../../config/db');

class Item {
  static create(data, callback) {
    const query = `INSERT INTO item (name, description, category_id, brand_id, cost, barcode, isService, image_url, allow_zero_sell)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [data.name, data.description, data.category_id, data.brand_id, data.cost, data.barcode, data.isService, data.image_url, data.allow_zero_sell];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = 'SELECT * FROM item WHERE deleted_at IS NULL';
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = 'SELECT * FROM item WHERE id = ? AND deleted_at IS NULL';
    db.query(query, [id], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE item SET name = ?, description = ?, category_id = ?, brand_id = ?, cost = ?, barcode = ?,isService = ? ,allow_zero_sell = ?, image_url = ?
                   WHERE id = ? AND deleted_at IS NULL`;
    const values = [data.name, data.description, data.category_id, data.brand_id, data.cost, data.barcode,data.isService,data.allow_zero_sell, data.image_url, id];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE item SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }

}

module.exports = Item;