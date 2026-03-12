# Starter App

A production-ready full-stack application built with **Express.js** and **React**.

Designed as a proper starting point — not a toy demo. The architecture, patterns,
and code quality are what you'd ship to production. Start building features
immediately, deploy when ready.

## Stack

| Layer        | Technology                              | Notes                              |
|--------------|-----------------------------------------|------------------------------------|
| **Server**   | Express.js 4                            | Middleware chain, route modules    |
| **Database** | SQLite (sql.js) / Postgres              | Swap via env var, zero code changes |
| **Auth**     | JWT + role-based access control         | Register, login, protected routes  |
| **Frontend** | React 18 + React Router v6             | SPA with client-side routing       |
| **State**    | React Context + useReducer              | AuthContext + AppContext            |
| **Styling**  | Tailwind CSS (CDN)                      | Utility-first, responsive          |

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
node server.js

# Open http://localhost:3000
```

**Demo accounts** (seeded automatically):
- `admin@example.com` / `admin123` (admin role)
- `user@example.com` / `user123` (user role)

## Project Structure

```
├── server.js                   # Entry point — middleware chain + startup
├── config.js                   # Centralized env var config
├── package.json                # Dependencies
├── .env.example                # Environment variable documentation
├── .ranger                     # AI agent context (project manifest)
│
├── db/
│   ├── database.js             # Database init, migrations, query helpers
│   ├── migrations/
│   │   └── 001_initial.js      # Schema: users, items tables + seed data
│   └── repositories/
│       ├── userRepository.js   # User CRUD (parameterized SQL)
│       └── itemRepository.js   # Item CRUD with JOINs, filters, stats
│
├── middleware/
│   ├── auth.js                 # JWT generation, verification, role checks
│   ├── errorHandler.js         # Global error handler + 404 / SPA fallback
│   ├── staticFiles.js          # Static file serving
│   └── validate.js             # Request body validation helpers
│
├── routes/
│   ├── auth.js                 # POST /api/auth/register, login, GET /me
│   └── items.js                # CRUD /api/items + GET /api/items/stats
│
├── public/                     # React SPA (served as static files)
│   ├── index.html              # HTML shell (loads React + Router from CDN)
│   ├── styles.css              # Custom animations
│   ├── lib/api.js              # API client with auth token handling
│   ├── store/
│   │   ├── AuthContext.js      # Auth state (login/register/logout)
│   │   └── AppContext.js       # App state (items CRUD, stats, filters)
│   ├── components/
│   │   ├── Navbar.js           # Top nav with auth status
│   │   ├── Toast.js            # Notification toasts
│   │   ├── ItemCard.js         # Item display card
│   │   └── ItemForm.js         # Item create/edit form
│   ├── pages/
│   │   ├── WelcomePage.js      # Landing page
│   │   ├── LoginPage.js        # Login form
│   │   ├── RegisterPage.js     # Registration form
│   │   └── DashboardPage.js    # Dashboard with stats + item list
│   └── App.js                  # Root — providers, router, routes
│
├── Dockerfile                  # Multi-stage production build
├── docker-compose.yml          # Local dev + optional Postgres
├── .dockerignore               # Docker build exclusions
├── README.md                   # This file
└── CONTRIBUTING.md             # Contribution guidelines
```

## API Reference

### Authentication

| Method | Endpoint             | Auth     | Description            |
|--------|----------------------|----------|------------------------|
| POST   | /api/auth/register   | Public   | Create account         |
| POST   | /api/auth/login      | Public   | Login, returns JWT     |
| GET    | /api/auth/me         | Required | Get current user       |

### Items

| Method | Endpoint             | Auth     | Description            |
|--------|----------------------|----------|------------------------|
| GET    | /api/items           | Required | List items (filterable)|
| POST   | /api/items           | Required | Create item            |
| GET    | /api/items/stats     | Required | Dashboard statistics   |
| GET    | /api/items/:id       | Required | Get single item        |
| PUT    | /api/items/:id       | Required | Update item            |
| DELETE | /api/items/:id       | Required | Delete item (owner/admin) |

**Query parameters** for GET /api/items:
- `status` — Filter by status (todo, in_progress, done)
- `priority` — Filter by priority (low, medium, high)

## Deployment

### Docker (Recommended)

```bash
# Build the image
docker build -t starter-app .

# Run with SQLite (data persists in a Docker volume)
docker run -d -p 3000:3000 \
  -v app-data:/app/data \
  -e JWT_SECRET=your-secret-here \
  starter-app

# Run with Postgres
docker run -d -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/dbname \
  -e JWT_SECRET=your-secret-here \
  starter-app
```

### Docker Compose

```bash
# SQLite mode (default)
docker compose up -d

# With Postgres
docker compose --profile postgres up -d
```

### Cloud Platforms

Works out of the box on any platform that supports Docker or Node.js:

| Platform             | Deploy Command / Notes                                    |
|----------------------|-----------------------------------------------------------|
| **Railway**          | Connect repo, auto-detects Dockerfile                     |
| **Render**           | New Web Service, Docker, set env vars                     |
| **Fly.io**           | `fly launch`, creates fly.toml automatically              |
| **AWS ECS**          | Push image to ECR, create task definition                 |
| **Google Cloud Run** | `gcloud run deploy --source .`                           |
| **DigitalOcean**     | App Platform, auto-detect Dockerfile                      |
| **Heroku**           | `heroku container:push web` then `heroku container:release web` |

### Manual Deployment (No Docker)

```bash
npm install --omit=dev
NODE_ENV=production JWT_SECRET=your-secret node server.js
```

## Database: SQLite vs Postgres

This app runs on **SQLite by default** — zero setup, great for POC/MVP/demos.
When you need multi-server or production scale, switch to Postgres with **zero
code changes** in your route/repository layer.

### When to Use SQLite (Default)

- POC, MVP, demos, hackathons
- Single-server deployments (< 1000 concurrent users)
- Embedded applications, edge deployments
- You want zero infrastructure dependencies

### When to Switch to Postgres

- Multiple application servers (horizontal scaling)
- Need concurrent writes from many users
- Want managed backups, point-in-time recovery
- Compliance requirements (SOC2, HIPAA)

### How to Migrate

1. **Install the Postgres driver:**
   ```bash
   npm install pg
   ```

2. **Replace `db/database.js`** with a Postgres version:
   ```javascript
   const { Pool } = require('pg');
   const pool = new Pool({ connectionString: process.env.DATABASE_URL });

   module.exports = {
     initialize: async () => { await runMigrations(); },
     run: (sql, params) => pool.query(sql, params),
     get: async (sql, params) => { const r = await pool.query(sql, params); return r.rows[0]; },
     all: async (sql, params) => { const r = await pool.query(sql, params); return r.rows; },
     exec: (sql) => pool.query(sql),
   };
   ```

3. **Set the environment variable:**
   ```bash
   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   ```

4. **Run migrations** — they execute automatically on startup. The SQL is
   standard and works on both SQLite and Postgres.

> The repository layer (`db/repositories/*.js`) uses parameterized SQL.
> For Postgres, change `?` placeholders to `$1, $2` style in the adapter.

## Environment Variables

| Variable       | Default                    | Description                        |
|----------------|----------------------------|------------------------------------|
| PORT           | 3000                       | Server listen port                 |
| NODE_ENV       | development                | Environment (development/production)|
| DATABASE_URL   | sqlite::memory:            | Database connection string         |
| JWT_SECRET     | sandbox-secret-key         | JWT signing secret (**change this**) |
| JWT_EXPIRES_IN | 24h                        | Token expiry duration              |
| CORS_ORIGIN    | *                          | Allowed CORS origins               |

## License

MIT
