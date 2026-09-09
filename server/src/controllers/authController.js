import { passwordService } from '../services/passwordService.js';
import { sessionService } from '../services/sessionService.js';

let currentAdminHashedPassword = null;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'dudhatashish1995@gmail.com';
const INITIAL_PLAIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Ashishkumar Dudhat';

// Initialize in-memory / env hashed password
passwordService.hashPassword(INITIAL_PLAIN_PASSWORD).then(hash => {
  currentAdminHashedPassword = hash;
}).catch(() => {});

export const authController = {
  /**
   * POST /api/admin/auth/login
   */
  async login(req, res) {
    const { email, password } = req.body || {};

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    // Generic response on failure to prevent account enumeration
    let isMatch = false;
    if (email === ADMIN_EMAIL) {
      if (currentAdminHashedPassword) {
        isMatch = await passwordService.verifyPassword(password, currentAdminHashedPassword);
      } else {
        isMatch = (password === INITIAL_PLAIN_PASSWORD);
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    // Create session
    const adminUser = {
      id: 'admin_usr_001',
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      role: 'ADMIN'
    };

    const session = await sessionService.createSession(adminUser);

    // Set secure HTTP-only cookie
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('admin_session', session.sessionToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: parseInt(process.env.ADMIN_SESSION_DURATION || '86400', 10) * 1000,
      path: '/'
    });

    return res.json({
      success: true,
      message: 'Authentication successful',
      token: session.sessionToken,
      csrfToken: session.csrfToken,
      data: {
        user: session.adminUser,
        expiresAt: session.expiresAt
      }
    });
  },

  /**
   * GET /api/admin/auth/me
   */
  async getProfile(req, res) {
    return res.json({
      success: true,
      data: {
        user: req.admin,
        csrfToken: req.csrfToken
      }
    });
  },

  /**
   * GET /api/admin/auth/csrf
   */
  async getCsrfToken(req, res) {
    return res.json({
      success: true,
      csrfToken: req.csrfToken
    });
  },

  /**
   * POST /api/admin/auth/change-password
   */
  async changePassword(req, res) {
    const { currentPassword, newPassword, confirmPassword } = req.body || {};

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password, new password, and confirmation are required.'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation do not match.'
      });
    }

    // Verify current password
    let isCurrentValid = false;
    if (currentAdminHashedPassword) {
      isCurrentValid = await passwordService.verifyPassword(currentPassword, currentAdminHashedPassword);
    } else {
      isCurrentValid = (currentPassword === INITIAL_PLAIN_PASSWORD);
    }

    if (!isCurrentValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    // Validate new password strength
    const strength = passwordService.validatePasswordStrength(newPassword);
    if (!strength.valid) {
      return res.status(400).json({
        success: false,
        message: strength.message
      });
    }

    // Hash new password and update
    currentAdminHashedPassword = await passwordService.hashPassword(newPassword);

    // Invalidate ALL active sessions for this admin user
    await sessionService.invalidateAllUserSessions(req.admin.id);
    res.clearCookie('admin_session', { path: '/' });

    return res.json({
      success: true,
      message: 'Password updated successfully. Please log in again with your new password.'
    });
  },

  /**
   * POST /api/admin/auth/logout
   */
  async logout(req, res) {
    const sessionToken = req.cookies?.admin_session || req.sessionToken;
    await sessionService.invalidateSession(sessionToken);

    res.clearCookie('admin_session', { path: '/' });

    return res.json({
      success: true,
      message: 'Logged out successfully'
    });
  },

  /**
   * GET /api/admin/auth/status
   */
  async status(req, res) {
    const sessionToken = req.cookies?.admin_session || req.headers.authorization?.replace('Bearer ', '');
    const session = await sessionService.getSession(sessionToken);
    
    if (session) {
      return res.json({
        authenticated: true,
        user: session.adminUser,
        csrfToken: session.csrfToken
      });
    }

    return res.json({
      authenticated: false
    });
  }
};
