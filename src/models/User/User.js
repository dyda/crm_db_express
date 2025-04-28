const db = require('../../config/db');

class User {
  static create(data, callback) {
    const query = `INSERT INTO users (name, username, phone, image, branch_id, password, remember_token, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    db.query(query, [
      data.name,
      data.username,
      data.phone,
      data.image,
      data.branch_id,
      data.password,
      data.remember_token
    ], callback);
  }

  static getAll(callback) {
    const query = 'SELECT * FROM users WHERE deleted_at IS NULL'; // Exclude soft-deleted users
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = 'SELECT * FROM users WHERE id = ? AND deleted_at IS NULL'; // Exclude soft-deleted users
    db.query(query, [id], callback);
  }

  static getByUsername(username, callback) {
    const query = 'SELECT * FROM users WHERE username = ? AND deleted_at IS NULL'; // Exclude soft-deleted users
    db.query(query, [username], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE users SET name = ?, username = ?, phone = ?, image = ?, branch_id = ?, password = ?, remember_token = ?, updated_at = NOW()
                   WHERE id = ? AND deleted_at IS NULL`; // Ensure the user is not soft-deleted
    db.query(query, [
      data.name,
      data.username,
      data.phone,
      data.image,
      data.branch_id,
      data.password,
      data.remember_token,
      id
    ], callback);
  }

  static delete(id, callback) {
    const query = `UPDATE users SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL`; // Soft delete
    db.query(query, [id], callback);
  }
}

module.exports = User;