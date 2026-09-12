/**
 * Startup Environment Variable Validation
 * Validates essential environment variables and fails fast in production if missing.
 */
export function validateEnvironment() {
  const isProd = process.env.NODE_ENV === 'production';
  const warnings = [];

  if (!process.env.ADMIN_EMAIL) {
    warnings.push('ADMIN_EMAIL is not set.');
  }

  if (isProd && !process.env.ADMIN_PASSWORD) {
    warnings.push('ADMIN_PASSWORD is not explicitly set in environment variables.');
  } else if (isProd && process.env.ADMIN_PASSWORD === 'admin123') {
    console.warn('[Security Notice] Recommended to change default ADMIN_PASSWORD in Render Environment Variables.');
  }

  if (isProd && !process.env.DATABASE_URL) {
    throw new Error('[CRITICAL CONFIG ERROR] In production, process.env.DATABASE_URL is mandatory!');
  }

  if (warnings.length > 0 && !isProd) {
    console.warn('[Env Notice]', warnings.join(' | '));
  }
}
