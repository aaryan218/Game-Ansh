class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

class BadRequestError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, 409);
  }
}

function globalErrorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ status: 'error', message: err.message });
  }
  // Postgres unique violation
  if (err.code === '23505') {
    return res.status(409).json({ status: 'error', message: 'Duplicate entry' });
  }
  // Postgres FK violation
  if (err.code === '23503') {
    return res.status(400).json({ status: 'error', message: 'Referenced record does not exist' });
  }
  console.error('[Unhandled Error]', err);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
}

module.exports = {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
  ConflictError,
  globalErrorHandler,
};
