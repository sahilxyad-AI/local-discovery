const express = require('express');
const router = express.Router();
const { processChatMessage } = require('../services/aiChatbotService');
const db = require('../db/database');

// Send chat message to AI Assistant
router.post('/', async (req, res) => {
  try {
    const { message, userLocation, conversationHistory } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const response = await processChatMessage({
      message: message.trim(),
      userLocation: userLocation || null,
      conversationHistory: conversationHistory || []
    });

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...response
    });
  } catch (err) {
    console.error('Error handling chat message:', err);
    res.status(500).json({
      error: 'Failed to process AI chat response',
      message: "I'm having a momentary hiccup connecting to the business registry. Please try asking again in a moment!"
    });
  }
});

// Quick prompt suggestions and categories
router.get('/quick-prompts', (req, res) => {
  res.json({
    welcomeMessage: "Hi! 👋 Welcome to LocalConnect. I'm your local discovery assistant. I can help you find trusted shops and service providers near you.\n\nWhat are you looking for today?",
    categoryButtons: [
      { id: 'restaurants', label: '🍽️ Restaurants', query: 'Suggest affordable restaurants nearby' },
      { id: 'home-services', label: '🔧 Home Services', query: 'Find the best electrician near me' },
      { id: 'healthcare', label: '🏥 Healthcare', query: 'Find a dentist who is open today' },
      { id: 'salons', label: '💇 Salons & Beauty', query: 'Find a salon offering services under ₹500' },
      { id: 'grocery', label: '🛒 Grocery Stores', query: 'Which grocery store has the highest rating near me?' },
      { id: 'electronics', label: '📱 Electronics & Repairs', query: 'Show me mobile repair shops with good reviews' }
    ],
    sampleQueries: [
      "Find the best electrician near me.",
      "Suggest affordable restaurants nearby.",
      "I need a reliable plumber in my area.",
      "Show me mobile repair shops with good reviews.",
      "Find a dentist who is open today.",
      "Which grocery store has the highest rating near me?",
      "Find a salon offering services under ₹500."
    ]
  });
});

module.exports = router;
