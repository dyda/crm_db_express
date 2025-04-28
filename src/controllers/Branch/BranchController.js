const Branch = require('../../models/Branch/Branch');
const Company = require('../../models/Company/Company');
const City = require('../../models/City/City');
const Region = require('../../models/region/Region');
const i18n = require('../../config/i18nConfig');

// Create branch
exports.createBranch = (req, res) => {
  const { company_id, name, type, address, wallet, city_id, region_id, phone_1, phone_2, manager_id, opening_date, state, working_hours, Latitude, Longitude } = req.body;

  // Validate required fields
  if (!company_id) {
    return res.status(400).json({ error: i18n.__('validation.required.company_id') });
  }
  if (!name) {
    return res.status(400).json({ error: i18n.__('validation.required.name') });
  }
  if (!city_id) {
    return res.status(400).json({ error: i18n.__('validation.required.city_id') });
  }
  if (!region_id) {
    return res.status(400).json({ error: i18n.__('validation.required.region_id') });
  }

 // Check if company_id, city_id, and region_id are valid
 Company.getById(company_id, (err, companyResult) => {
  if (err || companyResult.length === 0) {
    return res.status(400).json({ error: i18n.__('validation.invalid.company_id') });
  }

  City.getById(city_id, (err, cityResult) => {
    if (err || cityResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.city_id') });
    }

    Region.getById(region_id, (err, regionResult) => {
      if (err || regionResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.region_id') });
      }

      // Create branch record
      const branchData = { company_id, name, type, address, wallet, city_id, region_id, phone_1, phone_2, manager_id, opening_date, state, working_hours, Latitude, Longitude };
      Branch.create(branchData, (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: i18n.__('validation.unique.branch_name') });
          }
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: i18n.__('messages.branch_created'), id: result.insertId });
      });
    });
  });
});
};

// Get All Branches
exports.getAllBranches = (req, res) => {
  Branch.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
};

// Get Branch by ID
exports.getBranchById = (req, res) => {
  const { id } = req.params;
  Branch.getById(id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.branch_not_found') });
    res.status(200).json(result[0]);
  });
};

// Update Branch
exports.updateBranch = (req, res) => {
  const { id } = req.params;
  const { company_id, name, type, address, wallet, city_id, region_id, phone_1, phone_2, manager_id, opening_date, state, working_hours, Latitude, Longitude } = req.body;

  // Validate required fields
  if (!company_id) {
    return res.status(400).json({ error: i18n.__('validation.required.company_id') });
  }
  if (!name) {
    return res.status(400).json({ error: i18n.__('validation.required.name') });
  }
  if (!city_id) {
    return res.status(400).json({ error: i18n.__('validation.required.city_id') });
  }
  if (!region_id) {
    return res.status(400).json({ error: i18n.__('validation.required.region_id') });
  }

  // Check if company_id, city_id, and region_id are valid
  Company.getById(company_id, (err, companyResult) => {
    if (err || companyResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.company_id') });
    }

    City.getById(city_id, (err, cityResult) => {
      if (err || cityResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.city_id') });
      }

      Region.getById(region_id, (err, regionResult) => {
        if (err || regionResult.length === 0) {
          return res.status(400).json({ error: i18n.__('validation.invalid.region_id') });
        }

        // Update branch record
        const branchData = { company_id, name, type, address, wallet, city_id, region_id, phone_1, phone_2, manager_id, opening_date, state, working_hours, Latitude, Longitude };
        Branch.update(id, branchData, (err, result) => {
          if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
              return res.status(400).json({ error: i18n.__('validation.unique.branch_name') });
            }
            return res.status(500).json({ error: err.message });
          }
          if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.branch_not_found') });
          res.status(200).json({ message: i18n.__('messages.branch_updated') });
        });
      });
    });
  });
};

// Delete Branch
exports.deleteBranch = (req, res) => {
  const { id } = req.params;

  // Soft delete the branch
  Branch.deleteSoft(id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.branch_not_found') });
    res.status(200).json({ message: i18n.__('messages.branch_deleted') });
  });
};

// Increase wallet
exports.increaseWallet = (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: i18n.__('validation.invalid.amount') });
  }

  Branch.increaseWallet(id, amount, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_increasing_wallet') });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.branch_not_found') });
    res.status(200).json({ message: i18n.__('messages.wallet_increased') });
  });
};

// Decrease wallet
exports.decreaseWallet = (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: i18n.__('validation.invalid.amount') });
  }

  Branch.decreaseWallet(id, amount, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_decreasing_wallet') });
    if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.branch_not_found') });
    res.status(200).json({ message: i18n.__('messages.wallet_decreased') });
  });
};