const Zone = require('../../models/Zone/Zone');
const i18n = require('../../config/i18nConfig'); // Import i18n for localization

// Create zone
exports.createZone = (req, res) => {
  const { name, description } = req.body;

  // Validate required fields
  if (!name) {
    return res.status(400).json({ error: i18n.__('validation.required.zone_name') });
  }

    // Check if the zone name is unique
    Zone.getByName(name, (err, result) => {
      if (err) {
        return res.status(500).json({ error: i18n.__('messages.error_fetching_zone') });
      }
      if (result.length > 0) {
        return res.status(400).json({ error: i18n.__('validation.unique.zone_name') });
      }
  
      // Prepare data for saving
      const zoneData = { name, description };
  
      Zone.create(zoneData, (err, result) => {
        if (err) {
          return res.status(500).json({ error: i18n.__('messages.error_creating_zone') });
        }
        res.status(201).json({ message: i18n.__('messages.zone_created'), zone: { id: result.insertId, ...zoneData } });
      });
    });
};

// Get all zones
exports.getAllZones = (req, res) => {
  Zone.getAll((err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_zones') });
    }
    res.status(200).json(result);
  });
};

// Get zone by ID
exports.getZoneById = (req, res) => {
  const { id } = req.params;
  Zone.getById(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_zone') });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.zone_not_found') });
    }
    res.status(200).json(result[0]);
  });
};

// Update zone
exports.updateZone = (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  // Validate required fields
  if (!name) {
    return res.status(400).json({ error: i18n.__('validation.required.zone_name') });
  }

  // Check if the zone name is unique
  Zone.getByName(name, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_zone') });
    }
    if (result.length > 0 && result[0].id !== parseInt(id)) {
      return res.status(400).json({ error: i18n.__('validation.unique.zone_name') });
    }

    // Prepare data for updating
    const zoneData = { name, description };

    Zone.update(id, zoneData, (err, result) => {
      if (err) {
        return res.status(500).json({ error: i18n.__('messages.error_updating_zone') });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: i18n.__('validation.invalid.zone_not_found') });
      }
      res.status(200).json({ message: i18n.__('messages.zone_updated') });
    });
  });
};

// Soft delete zone
exports.deleteZone = (req, res) => {
  const { id } = req.params;
  Zone.deleteSoft(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_deleting_zone') });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.zone_not_found') });
    }
    res.status(200).json({ message: i18n.__('messages.zone_deleted') });
  });
};