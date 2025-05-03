const Region = require('../../models/region/Region');
const City = require('../../models/City/City');
const Zone = require('../../models/Zone/Zone');
const i18n = require('../../config/i18nConfig');

// Create region
exports.createRegion = (req, res) => {
  let { name, city_id, zone_id, user_id, type, sales_target, description, state } = req.body;

  // Validate required fields
  if (!name) return res.status(400).json({ error: i18n.__('validation.required.region_name') });
  if (!city_id) return res.status(400).json({ error: i18n.__('validation.required.city_id') });
  if (!zone_id) return res.status(400).json({ error: i18n.__('validation.required.zone_id') });

  // Set default values
  type = type ?? '';
  sales_target = Number(sales_target) || 0;
  description = description ?? '';
  state = state ?? '';

  // Validate related entities
  City.getById(city_id, (err, cityResult) => {
    if (err || cityResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.city_id') });
    }

    Zone.getById(zone_id, (err, zoneResult) => {
      if (err || zoneResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.zone_id') });
      }

      const regionData = { name, city_id, zone_id, user_id, type, sales_target, description, state };

      Region.create(regionData, (err, result) => {
        if (err) return res.status(500).json({ error: i18n.__('messages.error_creating_region') });

        res.status(201).json({
          message: i18n.__('messages.region_created'),
          region: { id: result.insertId, ...regionData },
        });
      });
    });
  });
};

// Get all regions
exports.getAllRegions = (req, res) => {
  Region.getAll((err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_regions') });
    res.status(200).json(result);
  });
};

// Get region by ID
exports.getRegionById = (req, res) => {
  const { id } = req.params;

  Region.getById(id, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_region') });

    if (result.length === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.region_not_found') });
    }

    res.status(200).json(result[0]);
  });
};

// Update region
exports.updateRegion = (req, res) => {
  const { id } = req.params;
  let { name, city_id, zone_id, user_id, type, sales_target, description, state } = req.body;

  if (!name) return res.status(400).json({ error: i18n.__('validation.required.region_name') });
  if (!city_id) return res.status(400).json({ error: i18n.__('validation.required.city_id') });
  if (!zone_id) return res.status(400).json({ error: i18n.__('validation.required.zone_id') });

  type = type ?? '';
  sales_target = Number(sales_target) || 0;
  description = description ?? '';
  state = state ?? '';

  City.getById(city_id, (err, cityResult) => {
    if (err || cityResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.city_id') });
    }

    Zone.getById(zone_id, (err, zoneResult) => {
      if (err || zoneResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.zone_id') });
      }

      const regionData = { name, city_id, zone_id, user_id, type, sales_target, description, state };

      Region.update(id, regionData, (err, result) => {
        if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_region') });

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: i18n.__('validation.invalid.region_not_found') });
        }

        res.status(200).json({ message: i18n.__('messages.region_updated') });
      });
    });
  });
};

// Soft delete region
exports.deleteRegion = (req, res) => {
  const { id } = req.params;

  Region.deleteSoft(id, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_region') });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.region_not_found') });
    }

    res.status(200).json({ message: i18n.__('messages.region_deleted') });
  });
};
