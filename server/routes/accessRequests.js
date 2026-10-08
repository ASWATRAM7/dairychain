const express = require('express');
const jwt = require('jsonwebtoken');
const AccessRequest = require('../models/AccessRequest');
const User = require('../models/User');

const router = express.Router();

const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// POST /api/access-requests — public, anyone can request access
router.post('/', async (req, res) => {
  try {
    const { name, email, password, requestedRole, reason } = req.body;

    if (!name || !email || !requestedRole) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const existingRequest = await AccessRequest.findOne({
      email: email.toLowerCase(),
      status: 'pending',
    });
    if (existingRequest) {
      return res.status(400).json({ error: 'You already have a pending request' });
    }

    const newRequest = new AccessRequest({
      name,
      email: email.toLowerCase(),
      password,
      requestedRole,
      reason: reason || '',
    });
    await newRequest.save();

    res.status(201).json({ success: true, request: newRequest });
  } catch (err) {
    console.error('Access request error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// GET /api/access-requests — admin only
router.get('/', requireAdmin, async (req, res) => {
  try {
    const requests = await AccessRequest.find().sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    console.error('List requests error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// POST /api/access-requests/:id/approve — admin only
router.post('/:id/approve', requireAdmin, async (req, res) => {
  try {
    const request = await AccessRequest.findById(req.params.id).select('+password');
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request already reviewed' });
    }

    const passwordToUse = request.password || 'Welcome@123';

    // Guard: user with this email already exists
    const existingUser = await User.findOne({ email: request.email });
    if (existingUser) {
      if (request.password) {
        existingUser.password = request.password;
        await existingUser.save();
      }
      request.status = 'approved';
      request.reviewedBy = req.user.id;
      request.reviewedAt = new Date();
      request.password = undefined;
      await request.save();

      return res.json({
        success: true,
        message: 'User already exists — credentials updated',
        user: {
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
        },
      });
    }

    const initials = request.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const newUser = new User({
      name: request.name,
      email: request.email,
      password: passwordToUse,
      role: request.requestedRole,
      initials,
    });
    await newUser.save();

    request.status = 'approved';
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    request.password = undefined;
    await request.save();

    res.json({
      success: true,
      user: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// POST /api/access-requests/:id/reject — admin only
router.post('/:id/reject', requireAdmin, async (req, res) => {
  try {
    const request = await AccessRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request already reviewed' });
    }

    request.status = 'rejected';
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    await request.save();

    res.json({ success: true, request });
  } catch (err) {
    console.error('Reject error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

module.exports = router;