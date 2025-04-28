const User = require('../../models/User/User');
const Branch = require('../../models/Branch/Branch');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const i18n = require('../../config/i18nConfig'); // Import i18n for localization

// Create user
exports.create = (req, res) => {
  const { name, username, phone, image, branch_id, password, remember_token } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({ error: i18n.__('validation.required.user_name') });
    }
    if (!username) {
      return res.status(400).json({ error: i18n.__('validation.required.username') });
    }
    if (!phone) {
      return res.status(400).json({ error: i18n.__('validation.required.phone') });
    }
    if (!password) {
      return res.status(400).json({ error: i18n.__('validation.required.password') });
    }
    if (!branch_id) {
      return res.status(400).json({ error: i18n.__('validation.required.branch_id') });
    }

  // Check if branch_id is valid
  Branch.getById(branch_id, (err, branchResult) => {
    if (err || branchResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.branch_id') });
    }

     // Check if username is unique
    User.getByUsername(username, (err, userResult) => {
      if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_user') });
      if (userResult.length > 0) {
        return res.status(400).json({ error: i18n.__('validation.unique.username') });
      }

  // Hash password
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Prepare data for saving
  const userData = { name, username, phone, image, branch_id, password: hashedPassword, remember_token };

  User.create(userData, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_creating_user') });
    res.status(201).json({ message: i18n.__('messages.user_created'), user: { id: result.insertId, ...userData } });
  });
});
});
};

// Get all users
exports.getAll = (req, res) => {
  User.getAll((err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_users') });
    res.status(200).json(result);
  });
};

// Get user by ID
exports.getById = (req, res) => {
  const { id } = req.params;
  User.getById(id, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_user') });
    if (result.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.user_not_found') });
    res.status(200).json(result[0]);
  });
};

// Update user
exports.update = (req, res) => {
  const { id } = req.params;
  const { name, username, phone, image, branch_id, password, remember_token } = req.body;

   // Validate input
   if (!name) {
    return res.status(400).json({ error: i18n.__('validation.required.user_name') });
  }
  if (!username) {
    return res.status(400).json({ error: i18n.__('validation.required.username') });
  }
  if (!phone) {
    return res.status(400).json({ error: i18n.__('validation.required.phone') });
  }
  if (!branch_id) {
    return res.status(400).json({ error: i18n.__('validation.required.branch_id') });
  }

    // Check if branch_id is valid
    Branch.getById(branch_id, (err, branchResult) => {
      if (err || branchResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.branch_id') });
      }

       // Check if username is unique
     User.getByUsername(username, (err, userResult) => {
      if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_user') });
      if (userResult.length > 0) {
        return res.status(400).json({ error: i18n.__('validation.unique.username') });
      }

    // Hash password if provided
    const hashedPassword = password ? bcrypt.hashSync(password, 10) : undefined;

    // Prepare data for updating
    const userData = { name, username, phone, image, branch_id, password: hashedPassword, remember_token };

    User.update(id, userData, (err, result) => {
      if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_user') });
      if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.user_not_found') });
      res.status(200).json({ message: i18n.__('messages.user_updated') });
    });
    });
  });
};

// Soft delete user
exports.delete = (req, res) => {
  const { id } = req.params;
  User.delete(id, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_user') });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.user_not_found') });
    res.status(200).json({ message: i18n.__('messages.user_deleted') });
  });
};

// Login user
exports.login = (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ error: i18n.__('validation.required.username_and_password') });
  }

  User.getByUsername(username, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_user') });
    if (result.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.user_not_found') });

    const user = result[0];

    // Check password
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: i18n.__('validation.invalid.password') });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, username: user.username }, 'your_jwt_secret', { expiresIn: '1h' });

    res.status(200).json({ message: i18n.__('messages.login_successful'), token });
  });
};

// Logout user
exports.logout = (req, res) => {
  // Invalidate the token (this can be done by implementing token blacklisting or simply by the client deleting the token)
  res.status(200).json({ message: i18n.__('messages.logout_successful') });
};

// Middleware to authenticate user
exports.authenticate = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: i18n.__('validation.required.token') });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (ex) {
    return res.status(400).json({ error: i18n.__('validation.invalid.token') });
  }
};