import rateLimit from 'express-rate-limit';

/**
 * Strict Rate Limiter for Login Endpoint
 * Allows max 5 login attempts per IP per 15 minutes window
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many login attempts. Please try again after 15 minutes.'
    }
  }
});

/**
 * Sensitive Mutation Rate Limiter (Password change, Publish All)
 * Allows max 10 requests per 15 minutes window
 */
export const sensitiveMutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded for sensitive operation. Please try again later.'
    }
  }
});

/**
 * Media Upload Rate Limiter
 * Allows max 30 uploads per IP per 15 minutes window
 */
export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Upload rate limit exceeded. Please try again later.'
    }
  }
});

/**
 * Public API Rate Limiter
 * Allows max 300 requests per IP per 15 minutes window
 */
export const publicApiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Public API rate limit exceeded.'
    }
  }
});
