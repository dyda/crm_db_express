const db = require('../../config/db');

class Branch {

  static create(data, callback) {
  const query = `INSERT INTO branch (company_id, name, type, address, city_id, region_id, phone_1, phone_2, user_id, opening_date, state, working_hours, Latitude, Longitude, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
  const values = [data.company_id, data.name, data.type, data.address, data.city_id, data.region_id, data.phone_1, data.phone_2, data.user_id, data.opening_date, data.state, data.working_hours, data.Latitude, data.Longitude];
  db.query(query, values, callback);
}

  static getAll(callback) {
    const query = `
      SELECT 
        branch.*, 
        users.name AS user_name, 
        city.name AS city_name, 
        company.name AS company_name, 
        region.name AS region_name
      FROM branch
      LEFT JOIN users ON branch.user_id = users.id
      LEFT JOIN city ON branch.city_id = city.id
      LEFT JOIN company ON branch.company_id = company.id
      LEFT JOIN region ON branch.region_id = region.id
      WHERE branch.deleted_at IS NULL
    `;
    db.query(query, callback);
  }
  static filter(filters, callback) {
    const baseQuery = `
      SELECT 
        branch.*, 
        users.name AS user_name, 
        city.name AS city_name, 
        company.name AS company_name, 
        region.name AS region_name
      FROM branch
      LEFT JOIN users ON branch.user_id = users.id
      LEFT JOIN city ON branch.city_id = city.id
      LEFT JOIN company ON branch.company_id = company.id
      LEFT JOIN region ON branch.region_id = region.id
      WHERE branch.deleted_at IS NULL
    `;
  
    const conditions = [];
    const values = [];
  
    if (filters.user_id) {
      conditions.push(`branch.user_id = ?`);
      values.push(filters.user_id);
    }
  
    if (filters.branch_name) {
      conditions.push(`branch.name LIKE ?`);
      values.push(`%${filters.branch_name}%`);
    }
  
    if (filters.city_id) {
      conditions.push(`branch.city_id = ?`);
      values.push(filters.city_id);
    }
  
    if (filters.region_id) {
      conditions.push(`branch.region_id = ?`);
      values.push(filters.region_id);
    }
  
    const whereClause = conditions.length > 0 
      ? ' AND ' + conditions.join(' AND ')
      : '';
  
    const finalQuery = baseQuery + whereClause;
  
    db.query(finalQuery, values, callback);
  }
  

  

  static getById(id, callback) {
    const query = `
      SELECT 
        branch.*, 
        users.name AS user_name, 
        city.name AS city_name, 
        company.name AS company_name, 
        region.name AS region_name
      FROM branch
      LEFT JOIN users ON branch.user_id = users.id
      LEFT JOIN city ON branch.city_id = city.id
      LEFT JOIN company ON branch.company_id = company.id
      LEFT JOIN region ON branch.region_id = region.id
      WHERE branch.id = ? AND branch.deleted_at IS NULL
    `;
    db.query(query, [id], callback);
  }

  static update(id, data, callback) {
    const query = `UPDATE branch SET company_id = ?, name = ?, type = ?, address = ?, city_id = ?, region_id = ?, phone_1 = ?, phone_2 = ?, user_id = ?, opening_date = ?, state = ?, working_hours = ?, Latitude = ?, Longitude = ?, updated_at = NOW()
                   WHERE id = ? AND deleted_at IS NULL`;
    const values = [data.company_id, data.name, data.type, data.address, data.city_id, data.region_id, data.phone_1, data.phone_2, data.user_id, data.opening_date, data.state, data.working_hours, data.Latitude, data.Longitude, id];
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