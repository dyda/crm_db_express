const db = require('../../config/db');

class Item {
  static create(data, callback) {
    const query = `INSERT INTO item (name, description, category_id, brand_id, cost, barcode, isService, image_url, allow_zero_sell)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [data.name, data.description, data.category_id, data.brand_id, data.cost, data.barcode, data.isService, data.image_url, data.allow_zero_sell];
    db.query(query, values, callback);
  }

  static getAll(callback) {
    const query = 'SELECT * FROM item WHERE deleted_at IS NULL';
    db.query(query, callback);
  }

  static getById(id, callback) {
    const query = 'SELECT * FROM item WHERE id = ? AND deleted_at IS NULL';
    db.query(query, [id], callback);
  }

   static getItemFullInfo(filters, callback) {
  let query = `
    SELECT SQL_CALC_FOUND_ROWS 
      i.id,
      MAX(i.name) AS name,
      MAX(i.barcode) AS barcode,
      MAX(i.cost) AS cost,
      MAX(i.description) AS description,
      iq.warehouse_id, 
      MAX(w.name) AS warehouse_name, 
      SUM(iq.quantity) AS quantity,
      MAX(ib.name) AS brand_name, 
      MAX(ic.name) AS category_name
    FROM item i
    LEFT JOIN item_brand ib ON ib.id = i.brand_id
    LEFT JOIN item_category ic ON i.category_id = ic.id
    LEFT JOIN item_quantity iq ON i.id = iq.item_id
    LEFT JOIN warehouse w ON iq.warehouse_id = w.id
    WHERE i.deleted_at IS NULL
  `;

  const values = [];

  // Filter by id (ignore others if ID is provided)
  if (filters.id !== undefined && filters.id !== '') {
    query += ` AND i.id = ?`;
    values.push(filters.id);
  } else {
    // Category filter
    if (filters.category_id) {
      query += ` AND i.category_id = ?`;
      values.push(filters.category_id);
    }

    // Brand filter
    if (filters.brand_id) {
      query += ` AND i.brand_id = ?`;
      values.push(filters.brand_id);
    }

    // Branch filter
    if (filters.branch_id) {
      query += ` AND i.branch_id = ?`;
      values.push(filters.branch_id);
    }

    // Name or barcode search
    const orConditions = [];
    const orValues = [];

    if (filters.name) {
      orConditions.push(`i.name LIKE ?`);
      orValues.push(`%${filters.name}%`);
    }
    if (filters.barcode) {
      orConditions.push(`i.barcode LIKE ?`);
      orValues.push(`%${filters.barcode}%`);
    }

    if (orConditions.length > 0) {
      query += ` AND (${orConditions.join(' OR ')})`;
      values.push(...orValues);
    }

    // Unit filter (via subquery)
    if (filters.unit_id) {
      query += ` AND i.id IN (SELECT item_id FROM item_unit WHERE unit_id = ?)`;
      values.push(filters.unit_id);
    }

    // Warehouse filter
    if (filters.warehouse_id) {
      query += ` AND iq.warehouse_id = ?`;
      values.push(filters.warehouse_id);
    }

    // Quantity filters
    if (filters.min_quantity) {
      query += ` AND iq.quantity >= ?`;
      values.push(filters.min_quantity);
    }

    if (filters.max_quantity) {
      query += ` AND iq.quantity <= ?`;
      values.push(filters.max_quantity);
    }
  }

  // GROUP BY to get one row per item per warehouse
  query += ` GROUP BY i.id, iq.warehouse_id,ib.id,ic.id`;

  // Sorting
  const allowedSortFields = [
    'i.id', 'i.name', 'i.category_id', 'i.brand_id', 'i.cost', 'i.barcode', 'i.allow_zero_sell'
  ];
  let sortBy = filters.sortBy && allowedSortFields.includes(filters.sortBy) ? filters.sortBy : 'i.id';
  let sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';

  query += ` ORDER BY ${sortBy} ${sortOrder}`;

  // Pagination
  let limit = parseInt(filters.pageSize, 10) || 10;
  let offset = 0;
  if (filters.page) {
    offset = (parseInt(filters.page, 10) - 1) * limit;
  }

  query += ` LIMIT ? OFFSET ?`;
  values.push(limit, offset);

  // Execute main query
  db.query(query, values, (err, results) => {
    if (err) return callback(err);

    // Get total rows
    db.query('SELECT FOUND_ROWS() as total', (err2, totalRows) => {
      if (err2) return callback(err2);
      callback(null, {
        results,
        total: totalRows[0].total
      });
    });
  });
    }

  static getByFilters(filters, callback) {
  // Base query
  let query = `
    SELECT SQL_CALC_FOUND_ROWS *
    FROM item
    WHERE deleted_at IS NULL
  `;
  const values = [];

  // If id is provided, only filter by id
  if (filters.id !== undefined && filters.id !== '') {
    query += ` AND id = ?`;
    values.push(filters.id);
  } else {
    // Category filter
    if (filters.category_id) {
      query += ` AND category_id = ?`;
      values.push(filters.category_id);
    }
    // Brand filter
    if (filters.brand_id) {
      query += ` AND brand_id = ?`;
      values.push(filters.brand_id);
    }
    // Service type filter
    if (filters.isService !== undefined && filters.isService !== '') {
      query += ` AND isService = ?`;
      values.push(filters.isService);
    }
    // Branch filter
    if (filters.branch_id) {
      query += ` AND branch_id = ?`;
      values.push(filters.branch_id);
    }
    // Name or barcode search (OR logic)
    if ((filters.name && filters.name !== '') || (filters.barcode && filters.barcode !== '')) {
      const orConditions = [];
      const orValues = [];
      if (filters.name && filters.name !== '') {
        orConditions.push(`name LIKE ?`);
        orValues.push(`%${filters.name}%`);
      }
      if (filters.barcode && filters.barcode !== '') {
        orConditions.push(`barcode LIKE ?`);
        orValues.push(`%${filters.barcode}%`);
      }
      query += ` AND (${orConditions.join(' OR ')})`;
      values.push(...orValues);
    }
  }

  // Sorting
  const allowedSortFields = [
    'id', 'name', 'category_id', 'brand_id', 'cost', 'barcode', 'isService', 'allow_zero_sell'
  ];
  let sortBy = filters.sortBy && allowedSortFields.includes(filters.sortBy) ? filters.sortBy : 'id';
  let sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';

  // Pagination
  const limit = filters.pageSize ? parseInt(filters.pageSize, 10) : 10;
  const offset = filters.page ? (parseInt(filters.page, 10) - 1) * limit : 0;

  query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
  values.push(limit, offset);

  // Execute query
  db.query(query, values, (err, results) => {
    if (err) return callback(err);
    db.query('SELECT FOUND_ROWS() as total', (err2, totalRows) => {
      if (err2) return callback(err2);
      callback(null, { results, total: totalRows[0].total });
    });
  });
}

  static update(id, data, callback) {
    const query = `UPDATE item SET name = ?, description = ?, category_id = ?, brand_id = ?, cost = ?, barcode = ?,isService = ? ,allow_zero_sell = ?, image_url = ?
                   WHERE id = ? AND deleted_at IS NULL`;
    const values = [data.name, data.description, data.category_id, data.brand_id, data.cost, data.barcode,data.isService,data.allow_zero_sell, data.image_url, id];
    db.query(query, values, callback);
  }

  static deleteSoft(id, callback) {
    const query = `UPDATE item SET deleted_at = NOW() WHERE id = ?`;
    db.query(query, [id], callback);
  }

}

module.exports = Item;