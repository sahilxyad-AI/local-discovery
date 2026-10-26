const express = require('express');
const router = express.Router();
const db = require('../db/database');

// List / Search businesses with filters
router.get('/', (req, res) => {
  try {
    const filters = {
      query: req.query.q || req.query.query,
      category: req.query.category,
      area: req.query.area,
      pincode: req.query.pincode,
      lat: req.query.lat,
      lng: req.query.lng,
      radius: req.query.radius,
      minRating: req.query.minRating,
      priceTier: req.query.priceTier,
      maxBudget: req.query.maxBudget,
      verifiedOnly: req.query.verifiedOnly === 'true',
      openNow: req.query.openNow === 'true',
      sort: req.query.sort
    };

    const businesses = db.getBusinesses(filters);
    res.json({
      count: businesses.length,
      filters,
      data: businesses
    });
  } catch (err) {
    console.error('Error fetching businesses:', err);
    res.status(500).json({ error: 'Failed to retrieve businesses' });
  }
});

// Get business by ID or slug
router.get('/:id', (req, res) => {
  try {
    const userLat = req.query.lat ? parseFloat(req.query.lat) : null;
    const userLng = req.query.lng ? parseFloat(req.query.lng) : null;

    const business = db.getBusinessById(req.params.id, userLat, userLng);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    res.json(business);
  } catch (err) {
    console.error('Error fetching business by id:', err);
    res.status(500).json({ error: 'Failed to retrieve business details' });
  }
});

// Register new business (Business Owner feature)
router.post('/', (req, res) => {
  try {
    const { name, category, phone, address, description, area, pincode } = req.body;
    if (!name || !category || !phone || !address) {
      return res.status(400).json({ error: 'Name, category, phone, and address are required' });
    }

    const created = db.createBusiness(req.body);
    res.status(201).json({
      success: true,
      message: 'Business registered successfully! You can now submit verification documents.',
      data: created
    });
  } catch (err) {
    console.error('Error creating business:', err);
    res.status(500).json({ error: 'Failed to register business' });
  }
});

// Update business details
router.put('/:id', (req, res) => {
  try {
    const updated = db.updateBusiness(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Business not found' });
    }
    res.json({
      success: true,
      message: 'Business profile updated successfully',
      data: updated
    });
  } catch (err) {
    console.error('Error updating business:', err);
    res.status(500).json({ error: 'Failed to update business profile' });
  }
});

// Submit customer inquiry / booking callback
router.post('/:id/inquiries', (req, res) => {
  try {
    const { customer_name, customer_phone, service_requested, message } = req.body;
    if (!customer_name || !customer_phone || !message) {
      return res.status(400).json({ error: 'Name, phone, and message are required' });
    }

    const inquiry = db.createInquiry({
      business_id: req.params.id,
      customer_name,
      customer_phone,
      service_requested,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Your inquiry has been sent to the business owner. They will contact you shortly.',
      data: inquiry
    });
  } catch (err) {
    console.error('Error creating inquiry:', err);
    res.status(500).json({ error: 'Failed to send inquiry' });
  }
});

module.exports = router;
