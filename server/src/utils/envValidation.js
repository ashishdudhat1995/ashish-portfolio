/**
 * Startup Environment Variable Validation
 * Validates essential environment variables and fails fast in production if missing.
 */
export function validateEnvironment() {
  const isProd = process.env.NODE_ENV === 'production';
  const warnings = [];

  if (!process.env.ADMIN_EMAIL) {
    warnings.push('ADMIN_EMAIL is not set. Defaulting to development email.');
  }

  if (isProd && (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === 'admin123')) {
    throw new Error('[CRITICAL CONFIG ERROR] In production, process.env.ADMIN_PASSWORD must be explicitly set to a strong custom password!');
  }

  if (isProd && !process.env.DATABASE_URL) {
    throw new Error('[CRITICAL CONFIG ERROR] In production, process.env.DATABASE_URL is mandatory!');
  }

  if (warnings.length > 0 && !isProd) {
    console.warn('[Env Notice]', warnings.join(' | '));
  }
}
