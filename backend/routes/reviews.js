const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Get reviews for a specific business
router.get('/:businessId', (req, res) => {
  try {
    const sort = req.query.sort || 'newest';
    const reviews = db.getReviews(req.params.businessId, sort);
    res.json({
      business_id: req.params.businessId,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Failed to retrieve reviews' });
  }
});

// Post a new review
router.post('/', (req, res) => {
  try {
    const { business_id, user_name, rating, title, comment, service_used, is_verified_transaction } = req.body;
    if (!business_id || !rating || !comment) {
      return res.status(400).json({ error: 'Business ID, rating, and comment are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const newReview = db.createReview({
      business_id,
      user_name: user_name || 'Verified Customer',
      rating,
      title,
      comment,
      service_used,
      is_verified_transaction: !!is_verified_transaction
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      data: newReview
    });
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// Business owner reply to a review
router.post('/:id/reply', (req, res) => {
  try {
    const { reply_text } = req.body;
    if (!reply_text || !reply_text.trim()) {
      return res.status(400).json({ error: 'Reply text is required' });
    }

    const updatedReview = db.replyToReview(req.params.id, reply_text.trim());
    if (!updatedReview) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({
      success: true,
      message: 'Reply posted successfully',
      data: updatedReview
    });
  } catch (err) {
    console.error('Error replying to review:', err);
    res.status(500).json({ error: 'Failed to post reply' });
  }
});

// Report a review for spam, inappropriate content, or fake transaction
router.post('/:id/report', (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Reason for reporting is required' });
    }

    const reported = db.reportReview(req.params.id, reason.trim());
    if (!reported) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({
      success: true,
      message: 'Review has been reported to the moderation team and flagged for review.',
      data: reported
    });
  } catch (err) {
    console.error('Error reporting review:', err);
    res.status(500).json({ error: 'Failed to report review' });
  }
});

module.exports = router;
