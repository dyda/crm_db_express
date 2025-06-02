const Item = require('../../models/Item/Item');
const i18n = require('../../config/i18nConfig'); // Import i18n for localization

const multer = require('multer');
const path = require('path');
const upload = multer({
  dest: path.join(__dirname, '../../uploads'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'image/svg+xml', 'image/bmp', 'image/tiff', 'image/avif'
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      req.fileValidationError = 'Invalid file type';
      return cb(null, false);
    }
    cb(null, true);
  },
});

// Create Item
// Create Item (with image upload)
exports.createItem = [
  upload.single('image'),
  (req, res) => {
    const itemData = req.body;
    if (req.file) {
      itemData.image_url = `/uploads/${req.file.filename}`;
    }

    // Validate required fields
    if (!itemData.name) {
      return res.status(400).json({ error: i18n.__('validation.required.item_name') });
    }
    if (itemData.name.length < 2 || itemData.name.length > 100) {
      return res.status(400).json({ error: i18n.__('validation.length.item_name') });
    }
    if (!itemData.cost) {
      return res.status(400).json({ error: i18n.__('validation.required.item_cost') });
    }

    // Set default values for optional fields
    itemData.brand_id = itemData.brand_id || 0;
    itemData.category_id = itemData.category_id || 0;
    itemData.allow_zero_sell = itemData.allow_zero_sell || 0;

    Item.create(itemData, (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          if (err.sqlMessage.includes('barcode')) {
            return res.status(400).json({ error: i18n.__('validation.unique.item_barcode') });
          }
          if (err.sqlMessage.includes('name')) {
            return res.status(400).json({ error: i18n.__('validation.unique.item_name') });
          }
        }
        return res.status(500).json({ error: i18n.__('messages.error_creating_item') });
      }
      res.status(201).json({ message: i18n.__('messages.item_created'), id: result.insertId });
    });
  }
];

// Get All Items
exports.getAllItems = (req, res) => {
  Item.getAll((err, results) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_items') });
    }
    res.status(200).json(results);
  });
};

// Get Item by ID
exports.getItemById = (req, res) => {
  const itemId = req.params.id;
  Item.getById(itemId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_item') });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.item_not_found') });
    }
    res.status(200).json(result[0]);
  });
};

// Update Item (with image upload)
exports.updateItem = [
  upload.single('image'),
  (req, res) => {
    const itemId = req.params.id;
    const itemData = req.body;
    if (req.file) {
      itemData.image_url = `/uploads/${req.file.filename}`;
    } else if (itemData.image_url) {
      // keep the existing image_url
    } else {
      // do not set image_url to null!
      delete itemData.image_url;
    }

    // Validate required fields
    if (!itemData.name) {
      return res.status(400).json({ error: i18n.__('validation.required.item_name') });
    }
    if (itemData.name.length < 2 || itemData.name.length > 200) {
      return res.status(400).json({ error: i18n.__('validation.length.item_name') });
    }
    if (!itemData.cost) {
      return res.status(400).json({ error: i18n.__('validation.required.item_cost') });
    }

    // Set default values for optional fields
    itemData.brand_id = itemData.brand_id || 0;
    itemData.category_id = itemData.category_id || 0;
    itemData.allow_zero_sell = itemData.allow_zero_sell || 0;

    Item.update(itemId, itemData, (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          if (err.sqlMessage.includes('barcode')) {
            return res.status(400).json({ error: i18n.__('validation.unique.item_barcode') });
          }
          if (err.sqlMessage.includes('name')) {
            return res.status(400).json({ error: i18n.__('validation.unique.item_name') });
          }
        }
        return res.status(500).json({ error: i18n.__('messages.error_updating_item') });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: i18n.__('validation.invalid.item_not_found') });
      }
      res.status(200).json({ message: i18n.__('messages.item_updated') });
    });
  }
];

// Delete Item
exports.deleteItem = (req, res) => {
  const itemId = req.params.id;
  Item.deleteSoft(itemId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_deleting_item') });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.item_not_found') });
    }
    res.status(200).json({ message: i18n.__('messages.item_deleted') });
  });
};




