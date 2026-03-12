/**
 * db/database.js — SQLite database via sql.js (WASM).
 *
 * Provides a Postgres-compatible interface:
 * - db.run(sql, params)    — Execute INSERT/UPDATE/DELETE, returns { changes }
 * - db.get(sql, params)    — SELECT single row, returns object or undefined
 * - db.all(sql, params)    — SELECT multiple rows, returns array
 * - db.exec(sql)           — Execute raw SQL (DDL, multi-statement)
 *
 * Migration runner applies numbered migration files in order.
 * Tracks applied migrations in a _migrations table.
 *
 * POSTGRES MIGRATION:
 * Replace this file with a 'pg' Pool wrapper exposing the same interface.
 * Change ? params to $1, $2 style. Everything else stays the same.
 */

var initSqlJs;
try {
  initSqlJs = require('sql.js');
} catch (e) {
  // Fallback: sql.js not installed yet, will be loaded later
  initSqlJs = null;
}

var _db = null;
var _ready = null;

var WASM_CDN_URL = 'https://cdn.jsdelivr.net/npm/sql.js@1.11.0/dist/sql-wasm.wasm';

/**
 * Initialize the database. Called once at server startup.
 * Returns a promise that resolves when the DB is ready.
 */
function initialize() {
  if (_ready) return _ready;

  _ready = _initializeInternal();
  return _ready;
}

async function _initializeInternal() {
  if (!initSqlJs) {
    initSqlJs = require('sql.js');
  }

  // PERF: Pre-fetch the WASM binary ourselves using browser fetch().
  // sql.js detects Nodepod as Node.js (because process.versions.node exists)
  // and tries to use fs.readFileSync() to load the WASM binary — which fails.
  // By fetching the binary ourselves and passing it as wasmBinary, we bypass
  // sql.js's environment detection entirely.
  console.log('[DB] Fetching sql.js WASM binary from CDN...');
  var wasmResponse = await fetch(WASM_CDN_URL);
  if (!wasmResponse.ok) {
    throw new Error('[DB] Failed to fetch WASM binary: HTTP ' + wasmResponse.status);
  }
  var wasmBinary = new Uint8Array(await wasmResponse.arrayBuffer());
  console.log('[DB] WASM binary loaded (' + wasmBinary.length + ' bytes)');

  // Initialize sql.js with the pre-fetched WASM binary
  var SQL = await initSqlJs({ wasmBinary: wasmBinary });

  _db = new SQL.Database();

  // Enable WAL mode equivalent (not applicable in-memory, but documents intent)
  _db.run('PRAGMA journal_mode=MEMORY');
  _db.run('PRAGMA foreign_keys=ON');

  // Create migrations tracking table
  _db.run(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Run migrations
  await _runMigrations();

  console.log('[DB] SQLite database initialized (sql.js WASM)');
  return _db;
}

/**
 * Run all pending migrations in order.
 */
async function _runMigrations() {
  var migrations = require('./migrations/001_initial');

  var applied = {};
  var rows = _db.exec('SELECT name FROM _migrations');
  if (rows.length > 0) {
    rows[0].values.forEach(function(row) {
      applied[row[0]] = true;
    });
  }

  migrations.forEach(function(migration) {
    if (!applied[migration.name]) {
      console.log('[DB] Running migration: ' + migration.name);
      // Use exec() instead of run() — migrations may contain multiple statements
      _db.exec(migration.up);
      _db.run('INSERT INTO _migrations (name) VALUES (?)', [migration.name]);
    }
  });
}

/**
 * Execute a query that modifies data (INSERT, UPDATE, DELETE).
 * @param {string} sql - SQL with ? placeholders
 * @param {Array} params - Parameter values
 * @returns {{ changes: number }} Number of affected rows
 */
function run(sql, params) {
  _db.run(sql, params || []);
  var result = _db.exec('SELECT changes() as changes');
  var changes = result.length > 0 ? result[0].values[0][0] : 0;
  return { changes: changes };
}

/**
 * Execute a SELECT query returning a single row.
 * @param {string} sql - SQL with ? placeholders
 * @param {Array} params - Parameter values
 * @returns {Object|undefined} Row as { column: value } or undefined
 */
function get(sql, params) {
  var stmt = _db.prepare(sql);
  stmt.bind(params || []);
  var row = undefined;
  if (stmt.step()) {
    row = stmt.getAsObject();
  }
  stmt.free();
  return row;
}

/**
 * Execute a SELECT query returning all matching rows.
 * @param {string} sql - SQL with ? placeholders
 * @param {Array} params - Parameter values
 * @returns {Array<Object>} Array of { column: value } objects
 */
function all(sql, params) {
  var stmt = _db.prepare(sql);
  stmt.bind(params || []);
  var rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * Execute raw SQL (for DDL or multi-statement queries).
 * @param {string} sql - Raw SQL
 */
function exec(sql) {
  _db.exec(sql);
}

/**
 * Get the last inserted row ID.
 * @returns {number}
 */
function lastInsertRowId() {
  var result = _db.exec('SELECT last_insert_rowid() as id');
  return result.length > 0 ? result[0].values[0][0] : 0;
}

module.exports = {
  initialize: initialize,
  run: run,
  get: get,
  all: all,
  exec: exec,
  lastInsertRowId: lastInsertRowId,
};
