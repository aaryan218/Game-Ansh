const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redis = require('../redis');

const writeLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 30,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
  message: { status: 'error', message: 'Too many requests, please try again later.' },
});

const strictLimiter = rateLimit({
  windowMs: Number(process.env.STRICT_LIMIT_WINDOW_MS) || 60 * 60 * 1000,
  max: Number(process.env.STRICT_LIMIT_MAX) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
  message: { status: 'error', message: 'Creation rate limit exceeded. Please wait before trying again.' },
});

module.exports = { writeLimiter, strictLimiter };
