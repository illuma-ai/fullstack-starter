/**
 * db/repositories/userRepository.js — User data access layer.
 *
 * All database queries for the users table. Uses parameterized SQL.
 * This file works identically with Postgres — just change ? to $1, $2.
 */

var db = require('../database');

/**
 * Find a user by ID.
 * @param {number} id
 * @returns {Object|undefined} User object (without password)
 */
function findById(id) {
  var user = db.get(
    'SELECT id, email, name, role, created_at FROM users WHERE id = ?',
    [id]
  );
  return user || undefined;
}

/**
 * Find a user by email (includes password for auth).
 * @param {string} email
 * @returns {Object|undefined} User object with password
 */
function findByEmail(email) {
  return db.get('SELECT * FROM users WHERE email = ?', [email]) || undefined;
}

/**
 * Create a new user.
 * @param {{ email: string, password: string, name: string, role?: string }} data
 * @returns {Object} Created user (without password)
 */
function create(data) {
  var role = data.role || 'user';
  db.run(
    'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
    [data.email, data.password, data.name, role]
  );
  var id = db.lastInsertRowId();
  return findById(id);
}

/**
 * Update a user.
 * @param {number} id
 * @param {{ email?: string, name?: string, role?: string }} data
 * @returns {Object|undefined} Updated user
 */
function update(id, data) {
  var fields = [];
  var values = [];

  if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email); }
  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
  if (data.role !== undefined) { fields.push('role = ?'); values.push(data.role); }

  if (fields.length === 0) return findById(id);

  values.push(id);
  db.run('UPDATE users SET ' + fields.join(', ') + ' WHERE id = ?', values);
  return findById(id);
}

/**
 * Get all users (without passwords).
 * @returns {Array<Object>}
 */
function findAll() {
  return db.all('SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC');
}

/**
 * Count total users.
 * @returns {number}
 */
function count() {
  var row = db.get('SELECT COUNT(*) as count FROM users');
  return row ? row.count : 0;
}

module.exports = {
  findById: findById,
  findByEmail: findByEmail,
  create: create,
  update: update,
  findAll: findAll,
  count: count,
};
