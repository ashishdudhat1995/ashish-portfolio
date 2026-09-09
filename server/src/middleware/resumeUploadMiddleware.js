import multer from 'multer';

// Configurable Max Upload Size (default 10MB)
const MAX_RESUME_SIZE_BYTES = parseInt(process.env.MAX_RESUME_SIZE_MB || '10', 10) * 1024 * 1024;

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_RESUME_SIZE_BYTES
  },
  fileFilter: (req, file, cb) => {
    const mimeType = (file.mimetype || '').toLowerCase();
    if (mimeType !== 'application/pdf') {
      return cb(new Error('Invalid file type. Only PDF documents (application/pdf) are allowed as resumes.'));
    }
    cb(null, true);
  }
});

export const singleResumeUploadMiddleware = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        const maxMb = process.env.MAX_RESUME_SIZE_MB || '10';
        return res.status(413).json({
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: `Uploaded resume exceeds maximum permitted size limit of ${maxMb}MB.`
          }
        });
      }
      return res.status(400).json({
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: err.message
        }
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FILE_TYPE',
          message: err.message
        }
      });
    }

    // If mediaId is provided in body, allow selecting existing Media Library asset
    const mediaId = req.body?.mediaId;
    if (mediaId && String(mediaId).trim() !== '') {
      return next();
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FILE',
          message: 'Please select a valid PDF resume file to upload or choose an existing PDF from the Media Library.'
        }
      });
    }

    // Inspect Magic Bytes for %PDF- header
    const fileHeader = req.file.buffer.slice(0, 5).toString('ascii');
    if (!fileHeader.startsWith('%PDF-')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PDF_HEADER',
          message: 'Security validation failed: Uploaded file is not a valid PDF document.'
        }
      });
    }

    next();
  });
};
