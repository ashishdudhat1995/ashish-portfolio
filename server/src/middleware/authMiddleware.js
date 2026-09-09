import { sessionService } from '../services/sessionService.js';

export const requireAdminAuth = async (req, res, next) => {
  try {
    let sessionToken = null;
    let isCookieAuth = false;

    // Check Authorization header first (Bearer Token authentication)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      sessionToken = req.headers.authorization.substring(7);
      isCookieAuth = false;
    } else if (req.cookies?.admin_session) {
      sessionToken = req.cookies.admin_session;
      isCookieAuth = true;
    }

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Session token missing.'
      });
    }

    const session = await sessionService.getSession(sessionToken);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication session.'
      });
    }

    // CSRF verification for state-changing HTTP methods when authenticated via Cookie
    const isStateChangingMethod = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method.toUpperCase());
    if (isCookieAuth && isStateChangingMethod) {
      const requestCsrfToken = req.headers['x-csrf-token'] || req.headers['x-xsrf-token'];
      if (!requestCsrfToken || requestCsrfToken !== session.csrfToken) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'CSRF_VERIFICATION_FAILED',
            message: 'Invalid or missing CSRF token.'
          }
        });
      }
    }

    req.admin = session.adminUser;
    req.sessionToken = sessionToken;
    req.csrfToken = session.csrfToken;
    next();
  } catch {
    return res.status(500).json({
      success: false,
      message: 'Authentication verification error.'
    });
  }
};
