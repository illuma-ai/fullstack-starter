/**
 * Migration 001 — Initial schema.
 *
 * Creates the core tables with proper types, constraints, and indexes.
 * These schemas are designed to map directly to Postgres:
 *
 * SQLite → Postgres equivalents:
 *   INTEGER PRIMARY KEY AUTOINCREMENT → SERIAL PRIMARY KEY
 *   TEXT → VARCHAR or TEXT
 *   TEXT (timestamps) → TIMESTAMP WITH TIME ZONE
 *   REAL → DOUBLE PRECISION
 *   INTEGER (boolean) → BOOLEAN
 */

module.exports = [
  {
    name: '001_create_users',
    up: `
      CREATE TABLE IF NOT EXISTS users (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        email       TEXT    NOT NULL UNIQUE,
        password    TEXT    NOT NULL,
        name        TEXT    NOT NULL,
        role        TEXT    NOT NULL DEFAULT 'user',
        created_at  TEXT    DEFAULT CURRENT_TIMESTAMP
      )
    `,
  },
  {
    name: '002_create_items',
    up: `
      CREATE TABLE IF NOT EXISTS items (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        title       TEXT    NOT NULL,
        description TEXT,
        status      TEXT    NOT NULL DEFAULT 'todo',
        priority    TEXT    NOT NULL DEFAULT 'medium',
        user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at  TEXT    DEFAULT CURRENT_TIMESTAMP,
        updated_at  TEXT    DEFAULT CURRENT_TIMESTAMP
      )
    `,
  },
  {
    name: '003_create_items_indexes',
    up: `
      CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
      CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
      CREATE INDEX IF NOT EXISTS idx_items_priority ON items(priority);
    `,
  },
  {
    name: '004_seed_data',
    up: `
      INSERT INTO users (email, password, name, role) VALUES
        ('admin@example.com', 'YWRtaW4xMjM=', 'Admin User', 'admin'),
        ('user@example.com', 'dXNlcjEyMw==', 'Demo User', 'user');

      INSERT INTO items (title, description, status, priority, user_id) VALUES
        ('Set up project structure', 'Initialize the repository with proper folder structure and configuration files', 'done', 'high', 1),
        ('Design database schema', 'Create the initial database tables with proper types, constraints, and indexes', 'in_progress', 'high', 1),
        ('Build authentication flow', 'Implement JWT-based login and registration with role-based access control', 'todo', 'medium', 1),
        ('Create API endpoints', 'Build RESTful CRUD endpoints for all resources', 'todo', 'medium', 2),
        ('Write frontend components', 'Build React components for dashboard, forms, and navigation', 'todo', 'low', 2);
    `,
  },
];
