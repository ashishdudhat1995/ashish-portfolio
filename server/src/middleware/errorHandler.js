export const errorHandler = (err, req, res, _next) => {
  const isProd = process.env.NODE_ENV === 'production';
  const requestId = req.id || req.headers['x-request-id'] || null;

  console.error(`[Server Error] [req:${requestId || 'N/A'}]`, err.stack || err.message || err);

  const statusCode = (res.statusCode && res.statusCode !== 200) ? res.statusCode : 500;
  const errorCode = err.code || (statusCode === 400 ? 'BAD_REQUEST' : (statusCode === 401 ? 'UNAUTHORIZED' : (statusCode === 403 ? 'FORBIDDEN' : (statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR'))));

  const responsePayload = {
    success: false,
    error: {
      code: errorCode,
      message: isProd && statusCode === 500 ? 'An unexpected server error occurred.' : (err.message || 'Internal Server Error'),
      ...(err.details ? { details: err.details } : {}),
      ...(requestId ? { requestId } : {})
    }
  };

  if (!isProd && err.stack) {
    responsePayload.error.stack = err.stack;
  }

  res.status(statusCode).json(responsePayload);
};
