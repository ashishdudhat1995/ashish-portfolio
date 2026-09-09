import crypto from 'crypto';

// Global publish version counter for cache invalidation
let currentPublishVersion = Date.now();

export const cacheService = {
  /**
   * Bumps the global publish version timestamp to invalidate public API ETags immediately on publish or CMS update
   */
  invalidatePublicCache() {
    currentPublishVersion = Date.now();
  },

  getPublishVersion() {
    return currentPublishVersion;
  }
};

/**
 * Public Cache Middleware: Enforces immediate validation (max-age=0, must-revalidate) with ETags and 304 Not Modified
 */
export function publicCacheMiddleware() {
  return (req, res, next) => {
    // Override res.json to attach Cache-Control and ETag headers
    const originalJson = res.json.bind(res);

    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300 && body) {
        const bodyStr = JSON.stringify(body);
        const etag = `W/"${crypto.createHash('md5').update(bodyStr + '_' + currentPublishVersion).digest('hex')}"`;

        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        res.setHeader('ETag', etag);

        if (req.headers['if-none-match'] === etag) {
          return res.status(304).end();
        }
      }
      return originalJson(body);
    };

    next();
  };
}

/**
 * Private No-Store Middleware for Admin & Authenticated endpoints
 */
export function noCacheMiddleware(req, res, next) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
}
