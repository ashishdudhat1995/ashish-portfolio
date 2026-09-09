import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || 'local';
const PUBLIC_BASE_URL = process.env.STORAGE_PUBLIC_BASE_URL || 'http://localhost:5000';
const LOCAL_UPLOADS_DIR = path.resolve(process.cwd(), 'server', 'uploads');

// Ensure local uploads directory exists
if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
  fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });
}

export const localStorageProvider = {
  /**
   * Generates a safe, unique storage key preventing path traversal
   */
  generateKey(originalFilename) {
    const ext = path.extname(originalFilename || '').toLowerCase().replace(/[^a-z0-9.]/g, '') || '.bin';
    const randomHash = crypto.randomBytes(16).toString('hex');
    const safeBaseName = path.basename(originalFilename || 'media', ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .substring(0, 30);
    return `${Date.now()}-${safeBaseName}-${randomHash}${ext}`;
  },

  /**
   * Save buffer to local disk
   */
  async uploadFile({ buffer, originalFilename, mimeType }) {
    const storageKey = this.generateKey(originalFilename);
    const filePath = path.join(LOCAL_UPLOADS_DIR, storageKey);

    // Prevent path traversal
    if (!filePath.startsWith(LOCAL_UPLOADS_DIR)) {
      throw new Error('Invalid path traversal attempt.');
    }

    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `${PUBLIC_BASE_URL}/uploads/${storageKey}`;

    return {
      storageKey,
      publicUrl,
      size: buffer.length
    };
  },

  /**
   * Delete file from local disk
   */
  async deleteFile(storageKey) {
    if (!storageKey || storageKey.includes('..') || storageKey.includes('/') || storageKey.includes('\\')) {
      throw new Error('Invalid storage key format.');
    }

    const filePath = path.join(LOCAL_UPLOADS_DIR, storageKey);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
    return true;
  },

  /**
   * Check if file exists on disk
   */
  fileExists(storageKey) {
    if (!storageKey || storageKey.includes('..') || storageKey.includes('/') || storageKey.includes('\\')) {
      return false;
    }
    const filePath = path.join(LOCAL_UPLOADS_DIR, storageKey);
    return fs.existsSync(filePath);
  },

  /**
   * Return a readable stream for file streaming
   */
  getFileStream(storageKey) {
    if (!storageKey || storageKey.includes('..') || storageKey.includes('/') || storageKey.includes('\\')) {
      throw new Error('Invalid storage key format.');
    }
    const filePath = path.join(LOCAL_UPLOADS_DIR, storageKey);
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found in storage.');
    }
    return fs.createReadStream(filePath);
  },

  /**
   * Get public URL for a given storage key
   */
  getPublicUrl(storageKey) {
    if (!storageKey) return null;
    if (storageKey.startsWith('http://') || storageKey.startsWith('https://') || storageKey.startsWith('/')) {
      return storageKey;
    }
    return `${PUBLIC_BASE_URL}/uploads/${storageKey}`;
  }
};

export const storageProvider = STORAGE_PROVIDER === 'local' ? localStorageProvider : localStorageProvider;
