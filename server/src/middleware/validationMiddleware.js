/**
 * Input validation & URL scheme sanitization middleware helpers
 */

const DANGEROUS_SCHEMES = ['javascript:', 'data:', 'vbscript:', 'file:'];

export const urlSanitizer = {
  /**
   * Verifies that a URL string uses a safe scheme (http, https, mailto, tel, relative path, or anchor).
   * Rejects dangerous protocols like javascript:, data:, vbscript:.
   */
  isSafeUrl(url) {
    if (!url || typeof url !== 'string') return true; // Empty URLs are allowed where optional
    const trimmed = url.trim().toLowerCase();

    for (const dangerous of DANGEROUS_SCHEMES) {
      if (trimmed.startsWith(dangerous)) {
        return false;
      }
    }

    // Allow relative URLs (/path, #anchor) and http/https/mailto/tel schemes
    if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true;

    try {
      const parsed = new URL(trimmed);
      return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol);
    } catch {
      // If URL parsing fails, permit simple relative links without dangerous protocols
      return !trimmed.includes(':');
    }
  }
};

/**
 * Middleware wrapper to validate request payload schemas
 */
export function validateBody(validatorFn) {
  return (req, res, next) => {
    const errors = validatorFn(req.body || {});
    if (errors && errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'The submitted data failed validation constraints.',
          details: errors
        }
      });
    }
    next();
  };
}

/**
 * Validates array of URLs inside payload object
 */
export function validatePayloadUrls(obj, fields = []) {
  const invalidFields = [];
  for (const field of fields) {
    const val = obj[field];
    if (val && !urlSanitizer.isSafeUrl(val)) {
      invalidFields.push(field);
    }
  }
  return invalidFields;
}
