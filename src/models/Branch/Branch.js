const db = require('../../config/db');

class Branch {
  static create(data, callback) {
    const query = `INSERT INTO branch (company_id, name, type, address, wallet, city_id, region_id, phone_1, phone_2, manager_id, opening_date, state, working_hours, Latitude, Longitude, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const values = [data.company_id, data.name, data.type, data.address, data.wallet, data.city_id, data.region_id, data.phone_1, data.phone_2, data.manager_id, data.opening_date, data.state, data.working_hours, data.Latitude, data.Longitude];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = 'SELECT * FROM branch WHERE deleted_at IS NULL';
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = 'SELECT * FROM branch WHERE id = ? AND deleted_at IS NULL';
    db.query(query, [id], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE branch SET company_id = ?, name = ?, type = ?, address = ?, wallet = ?, city_id = ?, region_id = ?, phone_1 = ?, phone_2 = ?, manager_id = ?, opening_date = ?, state = ?, working_hours = ?, Latitude = ?, Longitude = ?, updated_at = NOW()
                   WHERE id = ? AND deleted_at IS NULL`;
    const values = [data.company_id, data.name, data.type, data.address, data.wallet, data.city_id, data.region_id, data.phone_1, data.phone_2, data.manager_id, data.opening_date, data.state, data.working_hours, data.Latitude, data.Longitude, id];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE branch SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }


  static increaseWallet(id, amount, callback) {
    const query = `UPDATE branch SET wallet = wallet + ? WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [amount, id], callback);
  }

  static decreaseWallet(id, amount, callback) {
    const query = `UPDATE branch SET wallet = wallet - ? WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [amount, id], callback);
  }

  
}

module.exports = Branch;