/**
 * server.js — Express application entry point.
 *
 * Middleware chain:
 * 1. Body parsing (JSON)
 * 2. Request logging
 * 3. Static file serving (Nodepod-compatible)
 * 4. API routes (auth, items)
 * 5. SPA fallback (404 → index.html)
 * 6. Error handler
 */

var express = require('express');
var config = require('./config');
var db = require('./db/database');
var serveStatic = require('./middleware/staticFiles');
var errorHandler = require('./middleware/errorHandler');
var authRoutes = require('./routes/auth');
var itemRoutes = require('./routes/items');

var app = express();

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

// Parse JSON bodies
app.use(express.json());

// Request logging
app.use(function(req, res, next) {
  var start = Date.now();
  res.on('finish', function() {
    var duration = Date.now() - start;
    console.log(
      '[' + req.method + '] ' + req.path + ' → ' + res.statusCode + ' (' + duration + 'ms)'
    );
  });
  next();
});

// Static files (must be before API routes for / to serve index.html)
app.use(serveStatic);

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------

// Health check — used by Docker HEALTHCHECK, load balancers, and uptime monitors
app.get('/api/health', function(req, res) {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

app.use(errorHandler.notFound);
app.use(errorHandler.errorHandler);

// ---------------------------------------------------------------------------
// Start server after DB initialization
// ---------------------------------------------------------------------------

console.log('[Server] Initializing database...');

db.initialize().then(function() {
  console.log('[Server] Database ready, starting HTTP server...');
  app.listen(config.port, function() {
    console.log('');
    console.log('===========================================');
    console.log('  Server running on port ' + config.port);
    console.log('  Database: SQLite (sql.js WASM)');
    console.log('  Environment: ' + config.nodeEnv);
    console.log('===========================================');
    console.log('');
    console.log('Demo accounts:');
    console.log('  admin@example.com / admin123');
    console.log('  user@example.com  / user123');
    console.log('');
  });
}).catch(function(err) {
  console.error('[FATAL] Failed to initialize database:', err && err.message ? err.message : err);
  console.error('[FATAL] Stack:', err && err.stack ? err.stack : 'no stack');
});
