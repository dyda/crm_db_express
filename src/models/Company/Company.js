const db = require('../../config/db'); // MySQL connection

// Model for interacting with the 'companies' table
class Company {

  static create(data, callback) {
    
    const query = `INSERT INTO company (name, phone_1, phone_2, address, tagline, logo_1, email, currency_type, currency_symbol, note)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(query, [
      data.name,
      data.phone_1,
      data.phone_2,
      data.address,
      data.tagline,
      data.logo_1,
      data.email,
      data.currency_type,
      data.currency_symbol,
      data.note
    ], callback);
  }

  static getAll(callback) {
    const query = 'SELECT * FROM company WHERE deleted_at IS NULL'; // Exclude soft-deleted companies
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = 'SELECT * FROM company WHERE id = ? AND deleted_at IS NULL'; // Exclude soft-deleted company
    db.query(query, [id], callback);
  }
  static getLastInsertId(callback) {
    const query = 'SELECT MAX(id) AS lastId FROM company';
    db.query(query, (err, result) => {
      if (err) return callback(err, null);
      callback(null, result[0].lastId);
    });
  }
 

  static getByName(id, callback) {
    const query = 'SELECT * FROM company WHERE name = ? AND deleted_at IS NULL'; // Exclude soft-deleted company
    db.query(query, [id], callback);
  }

  static update(id, data, callback) {

    const query = `UPDATE company SET name = ?, phone_1 = ?, phone_2 = ?, address = ?, tagline = ?, logo_1 = ?, email = ?, currency_type = ?, currency_symbol = ?, note = ?
                   WHERE id = ? AND deleted_at IS NULL`; // Ensure the company is not soft-deleted
    db.query(query, [
      data.name,
      data.phone_1,
      data.phone_2,
      data.address,
      data.tagline,
      data.logo_1,
      data.email,
      data.currency_type,
      data.currency_symbol,
      data.note,
      id
    ], callback);

  }

  static deleteSoft(id, callback) {
    const query = `UPDATE company SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL`; // Soft delete
    db.query(query, [id], callback);
  }
  
}

module.exports = Company;
