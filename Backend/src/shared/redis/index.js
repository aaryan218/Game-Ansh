require('dotenv').config();
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on('error', (err) => console.error('[Redis Error]', err));
redis.on('connect', () => console.log('[Redis] Connected'));

module.exports = redis;
