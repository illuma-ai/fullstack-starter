/**
 * db/repositories/itemRepository.js — Item data access layer.
 *
 * All database queries for the items table. Uses parameterized SQL.
 * This file works identically with Postgres — just change ? to $1, $2.
 */

var db = require('../database');

/**
 * Find all items, optionally filtered by user_id, status, or priority.
 * @param {{ userId?: number, status?: string, priority?: string }} filters
 * @returns {Array<Object>}
 */
function findAll(filters) {
  var where = [];
  var params = [];
  filters = filters || {};

  if (filters.userId) {
    where.push('i.user_id = ?');
    params.push(filters.userId);
  }
  if (filters.status) {
    where.push('i.status = ?');
    params.push(filters.status);
  }
  if (filters.priority) {
    where.push('i.priority = ?');
    params.push(filters.priority);
  }

  var sql = `
    SELECT i.*, u.name as user_name, u.email as user_email
    FROM items i
    LEFT JOIN users u ON i.user_id = u.id
  `;
  if (where.length > 0) {
    sql += ' WHERE ' + where.join(' AND ');
  }
  sql += ' ORDER BY i.created_at DESC';

  return db.all(sql, params);
}

/**
 * Find a single item by ID.
 * @param {number} id
 * @returns {Object|undefined}
 */
function findById(id) {
  return db.get(
    `SELECT i.*, u.name as user_name, u.email as user_email
     FROM items i
     LEFT JOIN users u ON i.user_id = u.id
     WHERE i.id = ?`,
    [id]
  ) || undefined;
}

/**
 * Create a new item.
 * @param {{ title: string, description?: string, status?: string, priority?: string, user_id: number }} data
 * @returns {Object} Created item
 */
function create(data) {
  var status = data.status || 'todo';
  var priority = data.priority || 'medium';
  var description = data.description || '';

  db.run(
    'INSERT INTO items (title, description, status, priority, user_id) VALUES (?, ?, ?, ?, ?)',
    [data.title, description, status, priority, data.user_id]
  );
  var id = db.lastInsertRowId();
  return findById(id);
}

/**
 * Update an existing item.
 * @param {number} id
 * @param {{ title?: string, description?: string, status?: string, priority?: string }} data
 * @returns {Object|undefined} Updated item
 */
function update(id, data) {
  var fields = [];
  var values = [];

  if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title); }
  if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
  if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
  if (data.priority !== undefined) { fields.push('priority = ?'); values.push(data.priority); }

  if (fields.length === 0) return findById(id);

  fields.push("updated_at = datetime('now')");
  values.push(id);
  db.run('UPDATE items SET ' + fields.join(', ') + ' WHERE id = ?', values);
  return findById(id);
}

/**
 * Delete an item by ID.
 * @param {number} id
 * @returns {boolean} True if deleted
 */
function remove(id) {
  var result = db.run('DELETE FROM items WHERE id = ?', [id]);
  return result.changes > 0;
}

/**
 * Get aggregate statistics.
 * @returns {{ total: number, byStatus: Object, byPriority: Object }}
 */
function getStats() {
  var total = db.get('SELECT COUNT(*) as count FROM items');
  var byStatus = db.all('SELECT status, COUNT(*) as count FROM items GROUP BY status');
  var byPriority = db.all('SELECT priority, COUNT(*) as count FROM items GROUP BY priority');

  var statusMap = {};
  byStatus.forEach(function(row) { statusMap[row.status] = row.count; });

  var priorityMap = {};
  byPriority.forEach(function(row) { priorityMap[row.priority] = row.count; });

  return {
    total: total ? total.count : 0,
    byStatus: statusMap,
    byPriority: priorityMap,
  };
}

module.exports = {
  findAll: findAll,
  findById: findById,
  create: create,
  update: update,
  remove: remove,
  getStats: getStats,
};
