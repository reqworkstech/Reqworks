const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,                   // 30 attempts per window (friendly for testing but secure)
  message: {
    success: false,
    message: 'Too many attempts. Try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter };
