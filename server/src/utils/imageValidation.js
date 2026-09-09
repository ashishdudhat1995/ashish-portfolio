const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml',
  'application/pdf'
];

const MAX_FILE_SIZE_BYTES = parseInt(process.env.MAX_UPLOAD_SIZE || '10485760', 10); // Default 10MB

/**
 * Validates uploaded file MIME type and size
 */
export function validateFileMetadata(file) {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(1);
    throw new Error(`File size exceeds maximum allowed limit of ${sizeMb}MB.`);
  }

  const mime = (file.mimetype || file.mimeType || '').toLowerCase();
  if (!ALLOWED_MIME_TYPES.includes(mime)) {
    throw new Error(`Unsupported file type: '${mime}'. Allowed formats: JPEG, PNG, WebP, AVIF, GIF, SVG, PDF.`);
  }

  return true;
}

/**
 * SVG Sanitizer: Strips scripts, event handlers, and javascript: links to prevent stored XSS
 */
export function sanitizeSvgContent(rawSvgString) {
  if (!rawSvgString || typeof rawSvgString !== 'string') {
    throw new Error('Invalid SVG content.');
  }

  // 1. Reject explicit script tags or foreign object scripts
  if (/<script[\s\S]*?>[\s\S]*?<\/script>/gi.test(rawSvgString)) {
    throw new Error('SVG security error: Embedded <script> elements are strictly forbidden.');
  }

  // 2. Reject inline javascript: protocols in href or src
  if (/href\s*=\s*["']?\s*javascript:/gi.test(rawSvgString) || /src\s*=\s*["']?\s*javascript:/gi.test(rawSvgString)) {
    throw new Error('SVG security error: Inline javascript: URIs are strictly forbidden.');
  }

  // 3. Strip inline event handlers e.g. onload=, onerror=, onclick=
  let sanitized = rawSvgString.replace(/\s+on[a-z]+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s+on[a-z]+\s*=\s*`[^`]*`/gi, '');
  sanitized = sanitized.replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, '');

  return sanitized;
}

/**
 * Extract simple dimensions (width/height) from PNG/JPEG/SVG buffer headers
 */
export function extractDimensions(buffer, mimeType) {
  try {
    if (mimeType === 'image/png' && buffer.length >= 24) {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height };
    }

    if (mimeType === 'image/jpeg' && buffer.length >= 2) {
      let offset = 2;
      while (offset < buffer.length - 8) {
        const marker = buffer.readUInt16BE(offset);
        if (marker === 0xFFC0 || marker === 0xFFC2) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          return { width, height };
        }
        offset += 2 + buffer.readUInt16BE(offset + 2);
      }
    }

    if (mimeType === 'image/svg+xml') {
      const svgText = buffer.toString('utf-8');
      const widthMatch = svgText.match(/width=["'](\d+)(px)?["']/i);
      const heightMatch = svgText.match(/height=["'](\d+)(px)?["']/i);
      const width = widthMatch ? parseInt(widthMatch[1], 10) : null;
      const height = heightMatch ? parseInt(heightMatch[1], 10) : null;
      return { width, height };
    }
  } catch {
    // Fallback cleanly
  }
  return { width: null, height: null };
}
