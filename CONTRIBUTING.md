# Contributing

Thank you for considering contributing to this project.

## Development Setup

```bash
# Clone the repository
git clone <repo-url>
cd starter-app

# Install dependencies
npm install

# Start the development server
node server.js
```

The server starts on http://localhost:3000 with hot-reloadable frontend files.

## Project Architecture

This is a **monolith with clean separation of concerns**:

```
Request -> Express middleware chain -> Route handler -> Repository -> Database
                                                            |
Response <- JSON / HTML <- Route handler <- Repository result
```

### Key Conventions

1. **Database access goes through repositories** — never write SQL directly in
   routes. Add methods to `db/repositories/*.js`.

2. **Validation happens in middleware** — use `middleware/validate.js` helpers
   or add new ones. Routes assume valid data.

3. **Auth is JWT-based** — `middleware/auth.js` handles token generation,
   verification, and role checks. All `/api/*` routes (except auth) require
   a valid token.

4. **Frontend is a static SPA** — React components live in `public/`. State
   is managed via React Context providers in `public/store/`.

5. **Migrations are numbered** — add new files as `db/migrations/002_*.js`,
   `003_*.js`, etc. They run automatically on startup.

## Adding a New Resource

Example: adding a "comments" feature.

### 1. Database Migration

Create `db/migrations/002_comments.js`:
```javascript
module.exports = [
  {
    name: '005_create_comments',
    up: `
      CREATE TABLE IF NOT EXISTS comments (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        body        TEXT    NOT NULL,
        item_id     INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
        user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at  TEXT    DEFAULT CURRENT_TIMESTAMP
      )
    `,
  },
];
```

### 2. Repository

Create `db/repositories/commentRepository.js`:
```javascript
var db = require('../database');

function findByItemId(itemId) {
  return db.all(
    'SELECT c.*, u.name as author FROM comments c JOIN users u ON c.user_id = u.id WHERE c.item_id = ? ORDER BY c.created_at DESC',
    [itemId]
  );
}

function create(body, itemId, userId) {
  return db.run(
    'INSERT INTO comments (body, item_id, user_id) VALUES (?, ?, ?)',
    [body, itemId, userId]
  );
}

module.exports = { findByItemId, create };
```

### 3. Route

Create `routes/comments.js`:
```javascript
var express = require('express');
var router = express.Router();
var auth = require('../middleware/auth');
var comments = require('../db/repositories/commentRepository');

router.get('/items/:itemId/comments', auth.authenticate, function(req, res) {
  var rows = comments.findByItemId(req.params.itemId);
  res.json(rows);
});

router.post('/items/:itemId/comments', auth.authenticate, function(req, res) {
  var result = comments.create(req.body.body, req.params.itemId, req.user.id);
  res.status(201).json({ id: result.lastInsertRowId });
});

module.exports = router;
```

### 4. Mount the route in `server.js`:
```javascript
var commentRoutes = require('./routes/comments');
app.use('/api', commentRoutes);
```

### 5. Update `.ranger`

Add the new table schema, routes, and files to the `.ranger` manifest so the
AI agent knows about your changes.

## Code Style

- **JavaScript** (CommonJS) — no build step required
- **Semicolons** — yes
- **Quotes** — single quotes for strings
- **Indentation** — 2 spaces
- **Comments** — JSDoc on exported functions, inline comments for non-obvious logic
- **Error handling** — always pass errors to `next()` in Express middleware

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

When adding new features:
1. Add unit tests for repository methods
2. Add integration tests for API endpoints
3. Test both SQLite and Postgres if applicable

## Pull Request Checklist

- [ ] Code follows the project conventions above
- [ ] New database tables have a migration file
- [ ] New routes are documented in README.md API Reference
- [ ] New files are listed in `.ranger` manifest
- [ ] Tests pass locally
- [ ] No hardcoded secrets or credentials
