/**
 * middleware/auth.js — JWT authentication.
 *
 * In the sandbox, JWT is a base64-encoded JSON payload (no crypto).
 * In production, swap for the 'jsonwebtoken' package with real signing.
 *
 * Provides:
 * - generateToken(payload) — Create a JWT
 * - authenticate — Middleware to verify JWT and attach req.user
 * - requireRole(role) — Middleware to enforce role-based access
 */

var config = require('../config');

/**
 * Generate a JWT token.
 * Sandbox: base64-encoded JSON. Production: use jsonwebtoken.sign().
 *
 * @param {{ id: number, email: string, role: string }} payload
 * @returns {string} Token
 */
function generateToken(payload) {
  var data = {
    sub: payload.id,
    email: payload.email,
    role: payload.role,
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24h
  };
  // Sandbox: base64 encode (NOT secure — for demo only)
  // Production: return jwt.sign(data, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  return btoa(JSON.stringify(data));
}

/**
 * Verify and decode a JWT token.
 * @param {string} token
 * @returns {Object|null} Decoded payload or null
 */
function verifyToken(token) {
  try {
    // Sandbox: base64 decode
    // Production: return jwt.verify(token, config.jwtSecret);
    var data = JSON.parse(atob(token));
    if (data.exp && data.exp < Date.now()) return null;
    return data;
  } catch (e) {
    return null;
  }
}

/**
 * Hash a password.
 * Sandbox: base64 encode. Production: use bcrypt.hash().
 */
function hashPassword(password) {
  return btoa(password);
}

/**
 * Compare a password with its hash.
 * Sandbox: base64 compare. Production: use bcrypt.compare().
 */
function comparePassword(password, hash) {
  return btoa(password) === hash;
}

/**
 * Authentication middleware — verifies JWT from Authorization header.
 * Attaches decoded user info to req.user.
 */
function authenticate(req, res, next) {
  var authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  var token = authHeader.split(' ')[1];
  var decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = { id: decoded.sub, email: decoded.email, role: decoded.role };
  next();
}

/**
 * Role-based access middleware.
 * @param {...string} roles — Allowed roles
 * @returns {Function} Express middleware
 */
function requireRole() {
  var roles = Array.prototype.slice.call(arguments);
  return function(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (roles.indexOf(req.user.role) === -1) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = {
  generateToken: generateToken,
  verifyToken: verifyToken,
  hashPassword: hashPassword,
  comparePassword: comparePassword,
  authenticate: authenticate,
  requireRole: requireRole,
};
