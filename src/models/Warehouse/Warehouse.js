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

  static filter = (filters, callback) => {
  let sql = `
    SELECT w.*, b.name as branch_name
    FROM warehouse w
    LEFT JOIN branch b ON w.branch_id = b.id
    WHERE w.deleted_at IS NULL
  `;

  const params = [];

  if (filters.branch_name) {
    sql += ' OR b.name LIKE ?';
    params.push(`%${filters.branch_name}%`);
  }
  if (filters.name) {
    sql += ' OR w.name LIKE ?';
    params.push(`%${filters.name}%`);
  }
  if (filters.phone_1) {
    sql += ' OR w.phone_1 LIKE ?';
    params.push(`%${filters.phone_1}%`);
  }
  if (filters.phone_2) {
    sql += ' OR w.phone_2 LIKE ?';
    params.push(`%${filters.phone_2}%`);
  }
  if (filters.address) {
    sql += ' OR w.address LIKE ?';
    params.push(`%${filters.address}%`);
  }

  db.query(sql, params, callback);
};

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
