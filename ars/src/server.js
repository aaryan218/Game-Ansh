require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initSocket } = require('./shared/socket');
const { pool } = require('./shared/db');
const redis = require('./shared/redis');

const PORT = Number(process.env.PORT) || 3000;

async function start() {
  // Verify DB connection
  try {
    await pool.query('SELECT 1');
    console.log('[DB] Connected to PostgreSQL');
  } catch (err) {
    console.error('[DB] Failed to connect:', err);
    process.exit(1);
  }

  // Connect Redis (non-fatal)
  try {
    await redis.connect();
  } catch (err) {
    console.warn('[Redis] Could not connect — real-time and rate-limiting may be degraded:', err.message);
  }

  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`[Server] Gamers-G backend running on port ${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  const shutdown = async () => {
    console.log('[Server] Shutting down gracefully...');
    httpServer.close(async () => {
      await pool.end();
      await redis.quit();
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
