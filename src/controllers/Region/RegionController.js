const Region = require('../../models/Region/Region');
const i18n = require('../../config/i18nConfig');

const RegionController = {
  // Create region
  create: (req, res) => {
    const { name, city_id, zone_id } = req.body;

    // Validate required fields
    if (!name || !city_id || !zone_id) {
      return res.status(400).json({
        message: i18n.__('validation.required.fields'),
        errors: {
          ...( !name && { name: i18n.__('validation.required.region_name') }),
          ...( !city_id && { city_id: i18n.__('validation.invalid.city_id') }),
          ...( !zone_id && { zone_id: i18n.__('validation.invalid.zone_id') }),
        }
      });
    }

    Region.create(req.body, (err, result) => {
      if (err) return res.status(500).json({ message: i18n.__('messages.error_creating_region'), error: err });
      res.status(201).json({ message: i18n.__('messages.region_created'), id: result.insertId });
    });
  },

  // Get all regions
  getAll: (req, res) => {
    Region.getAll((err, results) => {
      if (err) return res.status(500).json({ message: i18n.__('messages.error_fetching_regions'), error: err });
      res.status(200).json(results);
    });
  },

   // Filter regions
filter: (req, res) => {


  Region.filter(req.query, (err, data) => {
    if (err) return res.status(500).json({ message: i18n.__('messages.error_fetching_regions'), error: err });
    res.status(200).json({
      regions: data.results,
      total: data.total,
    });
  });
},

  // Get region by id
  getById: (req, res) => {
    Region.getById(req.params.id, (err, results) => {
      if (err) return res.status(500).json({ message: i18n.__('messages.error_fetching_region'), error: err });
      if (!results.length) return res.status(404).json({ message: i18n.__('validation.invalid.region_not_found') });
      res.status(200).json(results[0]);
    });
  },

  // Update region
  update: (req, res) => {
    const { name, city_id, zone_id } = req.body;

    // Validate required fields
    if (!name || !city_id || !zone_id) {
      return res.status(400).json({
        message: i18n.__('validation.required.fields'),
        errors: {
          ...( !name && { name: i18n.__('validation.required.region_name') }),
          ...( !city_id && { city_id: i18n.__('validation.invalid.city_id') }),
          ...( !zone_id && { zone_id: i18n.__('validation.invalid.zone_id') }),
        }
      });
    }

    Region.update(req.params.id, req.body, (err, result) => {
      if (err) return res.status(500).json({ message: i18n.__('messages.error_updating_region'), error: err });
      res.status(200).json({ message: i18n.__('messages.region_updated') });
    });
  },

  // Soft delete region
  delete: (req, res) => {
    Region.deleteSoft(req.params.id, (err, result) => {
      if (err) return res.status(500).json({ message: i18n.__('messages.error_deleting_region'), error: err });
      res.status(200).json({ message: i18n.__('messages.region_deleted') });
    });
  }

};

module.exports = RegionController;