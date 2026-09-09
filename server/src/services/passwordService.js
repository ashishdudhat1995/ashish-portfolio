import bcrypt from 'bcryptjs';

const WORK_FACTOR = 12;

export const passwordService = {
  /**
   * Hashes plain text password using bcrypt with work factor 12
   */
  async hashPassword(plainText) {
    if (!plainText || typeof plainText !== 'string') {
      throw new Error('Password must be a non-empty string');
    }
    return await bcrypt.hash(plainText, WORK_FACTOR);
  },

  /**
   * Verifies plain text password against hashed password
   */
  async verifyPassword(plainText, hash) {
    if (!plainText || !hash) return false;
    try {
      return await bcrypt.compare(plainText, hash);
    } catch {
      return false;
    }
  },

  /**
   * Validates password strength for admin password updates:
   * Minimum 8 characters, must contain at least 1 uppercase letter, 1 lowercase letter, 1 number.
   */
  validatePasswordStrength(password) {
    if (!password || typeof password !== 'string') {
      return { valid: false, message: 'Password is required' };
    }
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    return { valid: true };
  }
};
