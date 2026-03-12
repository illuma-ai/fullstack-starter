/**
 * middleware/staticFiles.js — Static file serving for Nodepod.
 *
 * Nodepod doesn't support express.static() or res.sendFile().
 * This middleware reads files via fs.readFileSync and sends them
 * with proper Content-Type headers.
 *
 * PRODUCTION: Replace this entire middleware with express.static('public').
 */

var fs = require('fs');
var path = require('path');

var MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf':  'font/ttf',
};

/**
 * Static file serving middleware.
 * Serves files from the /public directory.
 */
function serveStatic(req, res, next) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();

  // Skip API routes
  if (req.path.startsWith('/api/')) return next();

  var reqPath = req.path === '/' ? '/index.html' : req.path;
  var filePath = path.join(__dirname, '..', 'public', reqPath);
  var ext = path.extname(filePath);

  // If no extension and not an API route, try serving index.html (SPA fallback)
  if (!ext) {
    filePath = path.join(__dirname, '..', 'public', 'index.html');
    ext = '.html';
  }

  try {
    var isBinary = ext === '.png' || ext === '.jpg' || ext === '.ico' || ext === '.woff' || ext === '.woff2' || ext === '.ttf';
    var data = fs.readFileSync(filePath, isBinary ? undefined : 'utf-8');
    res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
    res.send(data);
  } catch (e) {
    next();
  }
}

module.exports = serveStatic;
