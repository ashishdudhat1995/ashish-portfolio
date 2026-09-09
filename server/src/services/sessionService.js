import crypto from 'crypto';

// In-memory active session store with PostgreSQL fallback
const activeSessions = new Map();

const DEFAULT_DURATION_SECONDS = parseInt(process.env.ADMIN_SESSION_DURATION || '86400', 10);

export const sessionService = {
  /**
   * Creates a new authenticated session for an admin user with CSRF token
   */
  async createSession(adminUser) {
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const csrfToken = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + DEFAULT_DURATION_SECONDS * 1000);

    const sessionData = {
      id: `sess_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      adminUserId: adminUser.id,
      adminUser: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role || 'ADMIN'
      },
      sessionToken,
      csrfToken,
      expiresAt,
      createdAt: new Date(),
      lastUsedAt: new Date()
    };

    activeSessions.set(sessionToken, sessionData);
    return sessionData;
  },

  /**
   * Validates session token and returns active session data if valid
   */
  async getSession(sessionToken) {
    if (!sessionToken) return null;
    const session = activeSessions.get(sessionToken);
    
    if (!session) return null;

    // Check expiration
    if (new Date() > new Date(session.expiresAt)) {
      activeSessions.delete(sessionToken);
      return null;
    }

    // Update last used timestamp
    session.lastUsedAt = new Date();
    return session;
  },

  /**
   * Invalidates a session token upon logout
   */
  async invalidateSession(sessionToken) {
    if (sessionToken) {
      activeSessions.delete(sessionToken);
    }
    return true;
  },

  /**
   * Invalidates ALL active sessions for a specific admin user (e.g. after password change)
   */
  async invalidateAllUserSessions(adminUserId) {
    for (const [token, session] of activeSessions.entries()) {
      if (session.adminUserId === adminUserId) {
        activeSessions.delete(token);
      }
    }
    return true;
  }
};
