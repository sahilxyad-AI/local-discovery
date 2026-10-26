const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Current session demo user (defaults to customer, can be switched)
let currentSessionUser = db.data.users.find(u => u.role === 'customer') || {
  id: 'usr-customer-1',
  email: 'customer@localconnect.com',
  full_name: 'Priya Narayanan',
  role: 'customer',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
};

// Get current authenticated user
router.get('/me', (req, res) => {
  res.json({
    user: currentSessionUser,
    availableRoles: ['customer', 'owner', 'admin']
  });
});

// Quick role switch for demo / evaluator testing
router.post('/switch-role', (req, res) => {
  const { role } = req.body;
  if (!['customer', 'owner', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  const existingUser = db.data.users.find(u => u.role === role);
  if (existingUser) {
    currentSessionUser = existingUser;
  } else {
    currentSessionUser = {
      id: `usr-${role}-${Date.now()}`,
      email: `${role}@localconnect.com`,
      full_name: role === 'owner' ? 'Business Owner' : (role === 'admin' ? 'Admin Officer' : 'Customer User'),
      role,
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };
  }

  res.json({ success: true, user: currentSessionUser });
});

// User Login
router.post('/login', (req, res) => {
  const { email, role } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  let user = db.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    // Demo auto-registration if logging in with new email
    user = {
      id: `usr-${Date.now()}`,
      email,
      full_name: email.split('@')[0],
      role: role || 'customer',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString()
    };
    db.data.users.push(user);
    db.save();
  }

  currentSessionUser = user;
  res.json({ success: true, user });
});

// User Registration
router.post('/register', (req, res) => {
  const { email, full_name, role, phone } = req.body;
  if (!email || !full_name) {
    return res.status(400).json({ error: 'Email and full name are required' });
  }

  const existing = db.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'User with this email already exists. Please log in.' });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    email,
    full_name,
    role: role || 'customer',
    phone: phone || '',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  };

  db.data.users.push(newUser);
  db.save();
  currentSessionUser = newUser;

  res.status(201).json({ success: true, user: newUser });
});

module.exports = router;
