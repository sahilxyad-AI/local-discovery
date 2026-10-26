const express = require('express');
const router = express.Router();
const db = require('../db/database');

// List verification requests
router.get('/', (req, res) => {
  try {
    const status = req.query.status || null;
    const requests = db.getVerificationRequests(status);
    res.json({
      count: requests.length,
      data: requests
    });
  } catch (err) {
    console.error('Error fetching verification requests:', err);
    res.status(500).json({ error: 'Failed to retrieve verification requests' });
  }
});

// Submit a business verification request
router.post('/', (req, res) => {
  try {
    const { business_id, business_name, owner_name, owner_email, document_type, document_number, document_file_url, notes } = req.body;
    if (!business_id || !business_name || !document_number) {
      return res.status(400).json({ error: 'Business ID, Business Name, and Document Number are required' });
    }

    const created = db.createVerificationRequest({
      business_id,
      business_name,
      owner_name: owner_name || 'Business Owner',
      owner_email: owner_email || 'owner@example.com',
      document_type: document_type || 'Trade License & GSTIN',
      document_number,
      document_file_url: document_file_url || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Verification request submitted! Our Trust & Safety team will review your credentials within 24 hours.',
      data: created
    });
  } catch (err) {
    console.error('Error creating verification request:', err);
    res.status(500).json({ error: 'Failed to submit verification request' });
  }
});

// Admin review action (approve or reject)
router.post('/:id/review', (req, res) => {
  try {
    const { status, reviewer_name, rejection_reason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }

    const result = db.reviewVerificationRequest(
      req.params.id,
      status,
      reviewer_name || 'Admin Officer',
      rejection_reason || null
    );

    if (!result) {
      return res.status(404).json({ error: 'Verification request not found' });
    }

    res.json({
      success: true,
      message: status === 'approved' 
        ? 'Business verification approved! Verified badge and credentials have been activated.' 
        : 'Verification request marked as rejected.',
      data: result
    });
  } catch (err) {
    console.error('Error reviewing verification request:', err);
    res.status(500).json({ error: 'Failed to process verification review' });
  }
});

module.exports = router;
