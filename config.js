/**
 * config.js — Centralized configuration.
 *
 * Reads from process.env with sensible defaults for the sandbox.
 * In production, set real values via .env file or environment variables.
 */
var config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'sandbox-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  databaseUrl: process.env.DATABASE_URL || 'sqlite::memory:',
};

module.exports = config;
