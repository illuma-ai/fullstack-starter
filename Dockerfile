# ===========================================================================
# Dockerfile — Production-ready multi-stage build
#
# Supports two modes:
#   1. SQLite (default) — zero external dependencies, great for POC/MVP
#   2. Postgres — set DATABASE_URL to switch (no code changes needed)
#
# Build:
#   docker build -t starter-app .
#
# Run (SQLite — data persists via mounted volume):
#   docker run -p 3000:3000 \
#     -v app-data:/app/data \
#     -e JWT_SECRET=your-secret-here \
#     starter-app
#
# Run (Postgres):
#   docker run -p 3000:3000 \
#     -e DATABASE_URL=postgresql://user:pass@host:5432/dbname \
#     -e JWT_SECRET=your-secret-here \
#     starter-app
# ===========================================================================

# --- Stage 1: Dependencies ---------------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev

# --- Stage 2: Production image -----------------------------------------------
FROM node:20-alpine AS runtime

# Security: run as non-root
RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

# Copy dependencies from builder stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Remove files not needed in production
RUN rm -f Dockerfile .dockerignore docker-compose.yml CONTRIBUTING.md

# Create data directory for SQLite persistence (mounted as volume)
RUN mkdir -p /app/data && chown -R app:app /app/data

# Switch to non-root user
USER app

# Environment defaults — override at runtime via -e or .env
ENV NODE_ENV=production \
    PORT=3000 \
    DATABASE_URL=sqlite:/app/data/app.db \
    JWT_SECRET=change-me-in-production

EXPOSE 3000

# Health check — ensures container is marked healthy in orchestrators
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
