/**
 * routes/auth.js — Authentication endpoints.
 *
 * POST /api/auth/register — Create new account
 * POST /api/auth/login    — Sign in, receive JWT
 * GET  /api/auth/me       — Get current user profile
 */

var express = require('express');
var router = express.Router();
var auth = require('../middleware/auth');
var validate = require('../middleware/validate');
var userRepo = require('../db/repositories/userRepository');

/**
 * POST /api/auth/register
 * Body: { email, password, name }
 * Returns: { user, token }
 */
router.post('/register',
  validate.requireFields(['email', 'password', 'name']),
  function(req, res) {
    try {
      // Check if email already exists
      var existing = userRepo.findByEmail(req.body.email);
      if (existing) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      // Create user with hashed password
      var user = userRepo.create({
        email: req.body.email,
        password: auth.hashPassword(req.body.password),
        name: req.body.name,
        role: 'user',
      });

      var token = auth.generateToken(user);
      res.status(201).json({ user: user, token: token });
    } catch (err) {
      console.error('[Auth] Register error:', err.message);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: { user, token }
 */
router.post('/login',
  validate.requireFields(['email', 'password']),
  function(req, res) {
    try {
      var user = userRepo.findByEmail(req.body.email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      if (!auth.comparePassword(req.body.password, user.password)) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Return user without password
      var safeUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at,
      };

      var token = auth.generateToken(safeUser);
      res.json({ user: safeUser, token: token });
    } catch (err) {
      console.error('[Auth] Login error:', err.message);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

/**
 * GET /api/auth/me
 * Headers: Authorization: Bearer <token>
 * Returns: { user }
 */
router.get('/me', auth.authenticate, function(req, res) {
  try {
    var user = userRepo.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: user });
  } catch (err) {
    console.error('[Auth] Me error:', err.message);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;
