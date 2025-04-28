const db = require('../../config/db');

class ItemBrand {

    static create(data, callback) {
    const query = `INSERT INTO item_brand (name, description) VALUES (?, ?)`;
    const values = [data.name, data.description];
    db.query(query, values, (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return callback(new Error('Brand name must be unique'));
        }
        return callback(err);
      }
      callback(null, result);
    });
  }

  static getAll(callback) {
    const query = `SELECT * FROM item_brand WHERE deleted_at IS NULL`;
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = `SELECT * FROM item_brand WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [id], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE item_brand SET name = ?, description = ? WHERE id = ? AND deleted_at IS NULL`;
    const values = [data.name, data.description, id];
    db.query(query, values, (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return callback(new Error('Brand name must be unique'));
        }
        return callback(err);
      }
      callback(null, result);
    });
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE item_brand SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }
}

module.exports = ItemBrand;