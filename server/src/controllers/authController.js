import { PrismaClient } from '@prisma/client';
import { passwordService } from '../services/passwordService.js';
import { sessionService } from '../services/sessionService.js';
import { emailService } from '../services/emailService.js';

const prisma = new PrismaClient();

let currentAdminHashedPassword = null;
let currentResetCode = null;
let currentResetToken = null;
let resetCodeExpiresAt = null;

const getAdminEmail = () => (process.env.ADMIN_EMAIL || 'dudhatashish1995@gmail.com').trim();
const getInitialPassword = () => process.env.ADMIN_PASSWORD || 'admin123';
const getAdminName = () => process.env.ADMIN_NAME || 'Ashishkumar Dudhat';

/**
 * Dynamic getter for live admin credentials from process.env or PostgreSQL
 */
async function getAdminPasswordHash() {
  const adminEmail = getAdminEmail();
  try {
    const admin = await prisma.adminUser.findFirst({
      where: { email: adminEmail }
    }) || await prisma.adminUser.findFirst();

    if (admin && admin.passwordHash) {
      currentAdminHashedPassword = admin.passwordHash;
      return admin.passwordHash;
    }
  } catch {}

  if (!currentAdminHashedPassword) {
    currentAdminHashedPassword = await passwordService.hashPassword(getInitialPassword());
  }
  return currentAdminHashedPassword;
}

// Initial async load
getAdminPasswordHash().catch(() => {});

/**
 * Persist new hashed password to PostgreSQL database
 */
async function saveAdminPasswordHash(newHash) {
  currentAdminHashedPassword = newHash;
  const adminEmail = getAdminEmail();
  const adminName = getAdminName();
  try {
    const existingAdmin = await prisma.adminUser.findFirst({
      where: { email: adminEmail }
    }) || await prisma.adminUser.findFirst();

    if (existingAdmin) {
      await prisma.adminUser.update({
        where: { id: existingAdmin.id },
        data: { passwordHash: newHash }
      });
    } else {
      await prisma.adminUser.create({
        data: {
          email: adminEmail,
          name: adminName,
          passwordHash: newHash,
          role: 'ADMIN',
          isActive: true
        }
      });
    }
  } catch (err) {
    console.error('[Auth Error] Failed to persist new admin password to database:', err);
  }
}

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

    const activeHash = await getAdminPasswordHash();
    const adminEmail = getAdminEmail();

    // Generic response on failure to prevent account enumeration
    let isMatch = false;
    if (email.trim().toLowerCase() === adminEmail.toLowerCase()) {
      if (activeHash) {
        isMatch = await passwordService.verifyPassword(password, activeHash);
      } else {
        isMatch = (password === getInitialPassword());
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
      email: adminEmail,
      name: getAdminName(),
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

    const activeHash = await getAdminPasswordHash();

    // Verify current password
    let isCurrentValid = false;
    if (activeHash) {
      isCurrentValid = await passwordService.verifyPassword(currentPassword, activeHash);
    } else {
      isCurrentValid = (currentPassword === getInitialPassword());
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

    // Hash new password and persist permanently to PostgreSQL
    const newHash = await passwordService.hashPassword(newPassword);
    await saveAdminPasswordHash(newHash);

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
  },

  /**
   * POST /api/admin/auth/forgot-password
   */
  async forgotPassword(req, res) {
    const { email } = req.body || {};
    const adminEmail = getAdminEmail();

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Admin email address is required.'
      });
    }

    if (email.trim().toLowerCase() !== adminEmail.toLowerCase()) {
      return res.json({
        success: true,
        message: 'If the email matches the administrator account, a password reset verification code has been dispatched.'
      });
    }

    // Generate 6-digit random code
    currentResetCode = Math.floor(100000 + Math.random() * 900000).toString();
    resetCodeExpiresAt = Date.now() + (15 * 60 * 1000); // 15 mins

    // Dispatch email via Nodemailer
    await emailService.sendPasswordResetEmail(adminEmail, currentResetCode);

    return res.json({
      success: true,
      message: 'A 6-digit verification code has been dispatched to your email inbox.'
    });
  },

  /**
   * POST /api/admin/auth/verify-reset-code
   */
  async verifyResetCode(req, res) {
    const { email, code } = req.body || {};
    const adminEmail = getAdminEmail();

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and 6-digit verification code are required.'
      });
    }

    if (email.trim().toLowerCase() !== adminEmail.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or reset session.'
      });
    }

    if (!currentResetCode || !resetCodeExpiresAt || Date.now() > resetCodeExpiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.'
      });
    }

    if (code.trim() !== currentResetCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid 6-digit verification code. Please check your email inbox and try again.'
      });
    }

    // Generate single-use verification token for setting new password
    currentResetToken = 'rst_tok_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

    return res.json({
      success: true,
      verified: true,
      resetToken: currentResetToken,
      message: 'Verification code confirmed cleanly! You can now set your new password.'
    });
  },

  /**
   * POST /api/admin/auth/reset-password
   */
  async resetPassword(req, res) {
    const { email, resetToken, code, newPassword, confirmPassword } = req.body || {};
    const adminEmail = getAdminEmail();

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation are required.'
      });
    }

    if (email.trim().toLowerCase() !== adminEmail.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or reset session.'
      });
    }

    // Accept either valid resetToken OR direct code
    const isTokenValid = resetToken && currentResetToken && resetToken === currentResetToken;
    const isCodeValid = code && currentResetCode && code.trim() === currentResetCode && resetCodeExpiresAt && Date.now() <= resetCodeExpiresAt;

    if (!isTokenValid && !isCodeValid) {
      return res.status(400).json({
        success: false,
        message: 'Reset session expired or invalid code. Please request a new verification code.'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation do not match.'
      });
    }

    const strength = passwordService.validatePasswordStrength(newPassword);
    if (!strength.valid) {
      return res.status(400).json({
        success: false,
        message: strength.message
      });
    }

    // Hash new password and persist permanently to PostgreSQL
    const newHash = await passwordService.hashPassword(newPassword);
    await saveAdminPasswordHash(newHash);

    currentResetCode = null;
    currentResetToken = null;
    resetCodeExpiresAt = null;

    return res.json({
      success: true,
      message: 'Admin password reset successfully! You can now log in with your new password.'
    });
  },

  async resetToDefaultPassword() {
    const defaultHash = await passwordService.hashPassword(getInitialPassword());
    await saveAdminPasswordHash(defaultHash);
  }
};
