const db = require('../../config/db');

// Model for interacting with the 'Customer' table
class Customer {

  static create(data, callback) {
    const query = `INSERT INTO customer (category_id, zone_id, code, name, phone_1, phone_2, type, note, city_id, kafyl_name, kafyl_phone, state, address, cobon, limit_loan_price, limit_loan_day, loan, loan_start, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const values = [data.category_id, data.zone_id, data.code, data.name, data.phone_1, data.phone_2, data.type, data.note, data.city_id, data.kafyl_name, data.kafyl_phone, data.state, data.address, data.cobon, data.limit_loan_price, data.limit_loan_day, data.loan, data.loan_start];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = 'SELECT * FROM customer WHERE deleted_at IS NULL'; // Exclude soft-deleted customers
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = 'SELECT * FROM customer WHERE id = ? AND deleted_at IS NULL'; // Exclude soft-deleted customers
    db.query(query, [id], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE customer SET category_id = ?, zone_id = ?, code = ?, name = ?, phone_1 = ?, phone_2 = ?, type = ?, note = ?, city_id = ?, kafyl_name = ?, kafyl_phone = ?, state = ?, address = ?, cobon = ?, limit_loan_price = ?, limit_loan_day = ?, loan = ?, loan_start = ?, updated_at = NOW()
                   WHERE id = ? AND deleted_at IS NULL`;
    const values = [data.category_id, data.zone_id, data.code, data.name, data.phone_1, data.phone_2, data.type, data.note, data.city_id, data.kafyl_name, data.kafyl_phone, data.state, data.address, data.cobon, data.limit_loan_price, data.limit_loan_day, data.loan, data.loan_start, id];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE customer SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL`; // Soft delete
    db.query(query, [id], callback);
  }

  static increaseLoan(id, amount, callback) {
    const query = `UPDATE customer SET loan = loan + ? WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [amount, id], callback);
  }

  static decreaseLoan(id, amount, callback) {
    const query = `UPDATE customer SET loan = loan - ? WHERE id = ? AND deleted_at IS NULL`;
    db.query(query, [amount, id], callback);
  }

  static getLoan(id, callback) {
    const query = 'SELECT loan FROM customer WHERE id = ? AND deleted_at IS NULL';
    db.query(query, [id], callback);
  }
}

module.exports = Customer;