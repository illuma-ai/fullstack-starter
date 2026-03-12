/**
 * routes/items.js — Item CRUD endpoints.
 *
 * All routes require authentication (JWT).
 *
 * GET    /api/items       — List items (with optional filters)
 * POST   /api/items       — Create item
 * GET    /api/items/stats  — Get aggregate statistics
 * GET    /api/items/:id   — Get single item
 * PUT    /api/items/:id   — Update item
 * DELETE /api/items/:id   — Delete item
 */

var express = require('express');
var router = express.Router();
var auth = require('../middleware/auth');
var validate = require('../middleware/validate');
var itemRepo = require('../db/repositories/itemRepository');

// All item routes require authentication
router.use(auth.authenticate);

/**
 * GET /api/items
 * Query: ?status=todo&priority=high
 * Returns: { items: [...] }
 */
router.get('/', function(req, res) {
  try {
    var filters = {
      status: req.query.status || undefined,
      priority: req.query.priority || undefined,
    };
    var items = itemRepo.findAll(filters);
    res.json({ items: items });
  } catch (err) {
    console.error('[Items] List error:', err.message);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

/**
 * GET /api/items/stats
 * Returns: { total, byStatus, byPriority }
 */
router.get('/stats', function(req, res) {
  try {
    var stats = itemRepo.getStats();
    res.json(stats);
  } catch (err) {
    console.error('[Items] Stats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * GET /api/items/:id
 * Returns: { item }
 */
router.get('/:id', function(req, res) {
  try {
    var item = itemRepo.findById(parseInt(req.params.id, 10));
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ item: item });
  } catch (err) {
    console.error('[Items] Get error:', err.message);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

/**
 * POST /api/items
 * Body: { title, description?, status?, priority? }
 * Returns: { item }
 */
router.post('/',
  validate.requireFields(['title']),
  validate.allowedValues('status', ['todo', 'in_progress', 'done']),
  validate.allowedValues('priority', ['low', 'medium', 'high']),
  function(req, res) {
    try {
      var item = itemRepo.create({
        title: req.body.title,
        description: req.body.description || '',
        status: req.body.status || 'todo',
        priority: req.body.priority || 'medium',
        user_id: req.user.id,
      });
      res.status(201).json({ item: item });
    } catch (err) {
      console.error('[Items] Create error:', err.message);
      res.status(500).json({ error: 'Failed to create item' });
    }
  }
);

/**
 * PUT /api/items/:id
 * Body: { title?, description?, status?, priority? }
 * Returns: { item }
 */
router.put('/:id',
  validate.allowedValues('status', ['todo', 'in_progress', 'done']),
  validate.allowedValues('priority', ['low', 'medium', 'high']),
  function(req, res) {
    try {
      var existing = itemRepo.findById(parseInt(req.params.id, 10));
      if (!existing) {
        return res.status(404).json({ error: 'Item not found' });
      }

      var item = itemRepo.update(parseInt(req.params.id, 10), {
        title: req.body.title,
        description: req.body.description,
        status: req.body.status,
        priority: req.body.priority,
      });
      res.json({ item: item });
    } catch (err) {
      console.error('[Items] Update error:', err.message);
      res.status(500).json({ error: 'Failed to update item' });
    }
  }
);

/**
 * DELETE /api/items/:id
 * Returns: { message }
 */
router.delete('/:id', function(req, res) {
  try {
    var deleted = itemRepo.remove(parseInt(req.params.id, 10));
    if (!deleted) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item deleted' });
  } catch (err) {
    console.error('[Items] Delete error:', err.message);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = router;
