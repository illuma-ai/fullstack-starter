/**
 * middleware/errorHandler.js — Global error handling.
 *
 * - notFound: 404 handler that serves index.html for SPA routes
 * - errorHandler: Catches all errors, returns structured JSON
 */

var fs = require('fs');
var path = require('path');

/**
 * 404 handler — serves index.html for SPA routes, 404 JSON for API routes.
 */
function notFound(req, res, next) {
  // API routes get a JSON 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint not found: ' + req.method + ' ' + req.path });
  }

  // SPA fallback — serve index.html for all non-API routes
  try {
    var html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf-8');
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (e) {
    res.status(404).json({ error: 'Not found' });
  }
}

/**
 * Global error handler — catches thrown errors and returns structured JSON.
 */
function errorHandler(err, req, res, next) {
  var status = err.status || err.statusCode || 500;
  var message = err.message || 'Internal server error';

  console.error('[Error] ' + req.method + ' ' + req.path + ' — ' + status + ': ' + message);

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}

module.exports = {
  notFound: notFound,
  errorHandler: errorHandler,
};
