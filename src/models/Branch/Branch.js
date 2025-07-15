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
  
  static filter(params, callback) {
  let query = `
    SELECT SQL_CALC_FOUND_ROWS 
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
  const values = [];

  // Filtering
  if (params.id !== undefined && params.id !== null && params.id !== '') {
    query += ' AND branch.id = ?';
    values.push(Number(params.id));
  }
  if (params.branch_name && params.branch_name.trim() !== '') {
    query += ' AND branch.name LIKE ?';
    values.push(`%${params.branch_name}%`);
  }
  if (params.city_id && params.city_id !== '' && !isNaN(params.city_id)) {
    query += ' AND branch.city_id = ?';
    values.push(Number(params.city_id));
  }
  if (params.region_id && params.region_id !== '' && !isNaN(params.region_id)) {
    query += ' AND branch.region_id = ?';
    values.push(Number(params.region_id));
  }
  if (params.company_id && params.company_id !== '' && !isNaN(params.company_id)) {
    query += ' AND branch.company_id = ?';
    values.push(Number(params.company_id));
  }
  if (params.user_id && params.user_id !== '' && !isNaN(params.user_id)) {
    query += ' AND branch.user_id = ?';
    values.push(Number(params.user_id));
  }

  // Sorting
  let sortBy = params.sortBy || 'branch.id';
  let sortOrder = params.sortOrder === 'asc' ? 'ASC' : 'DESC';
  const allowedSortFields = [
    'branch.id', 'branch.name', 'branch.city_id', 'branch.region_id', 'branch.company_id', 'branch.user_id', 'branch.created_at', 'branch.updated_at'
  ];
  if (!allowedSortFields.includes(sortBy)) sortBy = 'branch.id';
  query += ` ORDER BY ${sortBy} ${sortOrder}`;

  // Pagination
  let limit = 10, offset = 0;
  if (params.pageSize) limit = parseInt(params.pageSize, 10);
  if (params.page) offset = (parseInt(params.page, 10) - 1) * limit;
  query += ` LIMIT ? OFFSET ?`;
  values.push(limit, offset);

  db.query(query, values, (err, results) => {
    if (err) return callback(err);
    db.query('SELECT FOUND_ROWS() as total', (err2, totalRows) => {
      if (err2) return callback(err2);
      callback(null, { results, total: totalRows[0].total });
    });
  });
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