// name, phone_1, phone_2, wallet, address, note
const db = require('../../config/db'); // MySQL connection

// Model for interacting with the 'Warehouse' table
class Warehouse {

  static create(data, callback) {
    
    const query = `INSERT INTO warehouse (name, phone_1, phone_2, address, note,branch_id)
                   VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(query, [
      data.name,
      data.phone_1,
      data.phone_2,
      data.address,
      data.note,
      data.branch_id,
    ], callback);
  }

  static getAll(callback) {
    const query = 'SELECT * FROM warehouse WHERE deleted_at IS NULL'; // Exclude soft-deleted companies
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = 'SELECT * FROM warehouse WHERE id = ? AND deleted_at IS NULL'; // Exclude soft-deleted company
    db.query(query, [id], callback);
  }

  static update(id, data, callback) {

    const query = `UPDATE warehouse SET name = ?, phone_1 = ?, phone_2 = ?, address = ?, note = ? , branch_id = ? 
                   WHERE id = ? AND deleted_at IS NULL`; // Ensure the company is not soft-deleted
    db.query(query, [
      data.name,
      data.phone_1,
      data.phone_2,
      data.address,
      data.note,
      data.branch_id,
      id
    ], callback);

  }

  static delete(id, callback) {
    const query = `UPDATE warehouse SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL`; // Soft delete
    db.query(query, [id], callback);
  }

  static getBranchWarehouse(branch_id,callback){
    const query = 'SELECT * FROM warehouse WHERE branch_id = ? AND deleted_at IS NULL'; // Exclude soft-deleted companies
    db.query(query, [branch_id], callback);
  }
  


}

module.exports = Warehouse;
