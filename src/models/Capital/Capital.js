const db = require('../../config/db');


class CompanyCapital {
  static create(data, callback) {
    const query = `INSERT INTO capital (company_id, amount, type, date, note) VALUES (?, ?, ?, ?, ?)`;
    const values = [data.company_id, data.amount, data.type, data.date, data.note];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = `SELECT * FROM capital WHERE deleted_at IS NULL`;
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = `SELECT * FROM capital WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [id], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE capital SET company_id = ?, amount = ?, type = ?, date = ?, note = ? WHERE id = ? AND deleted_at IS NULL`;
    const values = [data.company_id, data.amount, data.type, data.date, data.note, id];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE capital SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }
}

module.exports = CompanyCapital;