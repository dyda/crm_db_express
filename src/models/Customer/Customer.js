const db = require('../../config/db');

// Model for interacting with the 'Customer' table
class Customer {

   static create(data, callback) {
    const query = `INSERT INTO customer (category_id, zone_id, code, name, phone_1, phone_2, type, note, city_id, kafyl_name, kafyl_phone, state, address, cobon, limit_loan_price, limit_loan_day, loan, loan_start, latitude, longitude, mandub_id, currency_id, price_type_id, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const values = [
      data.category_id, data.zone_id, data.code, data.name, data.phone_1, data.phone_2, data.type, data.note,
      data.city_id, data.kafyl_name, data.kafyl_phone, data.state, data.address, data.cobon, data.limit_loan_price,
      data.limit_loan_day, data.loan, data.loan_start, data.latitude, data.longitude, data.mandub_id,
      data.currency_id,
      data.price_type_id ?? 0
    ];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = 'SELECT * FROM customer WHERE deleted_at IS NULL'; // Exclude soft-deleted customers
    db.query(query, callback);
  }

 static autocompleteSearch(q, limit = 30, callback) {
  const query = `
    SELECT id, code, name, phone_1
    FROM customer
    WHERE deleted_at IS NULL
      AND (
        code LIKE ? OR
        name LIKE ? OR
        phone_1 LIKE ?
      )
    ORDER BY id DESC
    LIMIT ?
  `;
  const like = `%${q}%`;
  db.query(query, [like, like, like, Number(limit)], callback);
}

  static getById(id, callback) {
    const query = 'SELECT * FROM customer WHERE id = ? AND deleted_at IS NULL'; // Exclude soft-deleted customers
    db.query(query, [id], callback);
  }


  static filter({
  page = 1,
  pageSize = 10,
  sortBy = 'id',
  sortOrder = 'asc',
  search,
  type,
  state,
  zone_id,
  category_id,
  city_id,
  mandub_id,
  currency_id,
  price_type_id,
  loan_positive = false,
  loan_negative = false,
  loan_zero = false
}, callback) {
  let query = `SELECT * FROM customer WHERE deleted_at IS NULL`;
  const params = [];
  if (type) { query += ` AND type = ?`; params.push(type); }
  if (state) { query += ` AND state = ?`; params.push(state); }
  if (zone_id) { query += ` AND zone_id = ?`; params.push(Number(zone_id)); }
  if (category_id) { query += ` AND category_id = ?`; params.push(Number(category_id)); }
  if (city_id) { query += ` AND city_id = ?`; params.push(Number(city_id)); }
  if (mandub_id) { query += ` AND mandub_id = ?`; params.push(Number(mandub_id)); }
  if (currency_id) { query += ` AND currency_id = ?`; params.push(Number(currency_id)); }
 if (price_type_id !== undefined && price_type_id !== null && price_type_id !== '' && Number(price_type_id) !== 0) {
  query += ` AND price_type_id = ?`; params.push(Number(price_type_id));
}

  if (loan_positive) query += ` AND loan > 0`;
  if (loan_negative) query += ` AND loan < 0`;
  if (loan_zero) query += ` AND loan = 0`;

  if (search) {
    query += ` AND (name LIKE ? OR phone_1 LIKE ? OR phone_2 LIKE ?)`;
    for (let i = 0; i < 3; i++) params.push(`%${search}%`);
  }

  query += ` ORDER BY ${sortBy} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
  const offset = (page - 1) * pageSize;
  query += ` LIMIT ? OFFSET ?`;
  params.push(Number(pageSize), Number(offset));

  db.query(query, params, callback);
}

    static update(id, data, callback) {
    const query = `UPDATE customer SET category_id = ?, zone_id = ?, code = ?, name = ?, phone_1 = ?, phone_2 = ?, type = ?, note = ?, city_id = ?, kafyl_name = ?, kafyl_phone = ?, state = ?, address = ?, cobon = ?, limit_loan_price = ?, limit_loan_day = ?, loan = ?, loan_start = ?, latitude = ?, longitude = ?, mandub_id = ?, currency_id = ?, price_type_id = ?, updated_at = NOW()
                   WHERE id = ? AND deleted_at IS NULL`;
    const values = [
      data.category_id, data.zone_id, data.code, data.name, data.phone_1, data.phone_2, data.type, data.note,
      data.city_id, data.kafyl_name, data.kafyl_phone, data.state, data.address, data.cobon, data.limit_loan_price,
      data.limit_loan_day, data.loan, data.loan_start, data.latitude, data.longitude, data.mandub_id,
      data.currency_id,
      data.price_type_id ?? 0, // price_type_id is optional
      id
    ];
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