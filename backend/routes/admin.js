const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Admin Dashboard stats
router.get('/stats', (req, res) => {
  try {
    const stats = db.getAdminStats();
    res.json(stats);
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ error: 'Failed to retrieve admin stats' });
  }
});

// Flagged / Reported reviews list
router.get('/flagged-reviews', (req, res) => {
  try {
    const flagged = db.data.reviews.filter(r => r.is_reported || r.moderation_status === 'flagged');
    res.json({
      count: flagged.length,
      data: flagged
    });
  } catch (err) {
    console.error('Error fetching flagged reviews:', err);
    res.status(500).json({ error: 'Failed to retrieve flagged reviews' });
  }
});

// Moderate review action: approve or remove
router.post('/reviews/:id/action', (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'remove'
    const review = db.data.reviews.find(r => r.id === req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (action === 'remove') {
      review.moderation_status = 'removed';
      review.is_reported = false;
    } else {
      review.moderation_status = 'approved';
      review.is_reported = false;
      review.report_reason = null;
    }

    // Recalculate business rating
    db.recalculateBusinessRating(review.business_id);
    db.save();

    res.json({
      success: true,
      message: action === 'remove' ? 'Review removed permanently' : 'Review approved and cleared',
      data: review
    });
  } catch (err) {
    console.error('Error moderating review:', err);
    res.status(500).json({ error: 'Failed to moderate review' });
  }
});

module.exports = router;
