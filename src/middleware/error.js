// src/middleware/error.js
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Error types
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  // Ensure statusCode is always a valid number
  const statusCode = err.statusCode || 500;

  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    user: req.user ? req.user.id : 'unauthorized',
  });

  if (process.env.NODE_ENV === 'development') {
    res.status(statusCode).json({
      status: 'error',
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // Production error response
    res.status(statusCode).json({
      status: 'error',
      message: err.isOperational ? err.message : 'Something went wrong',
    });
  }
};

// Not Found error handler
const notFound = (req, res, next) => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

// Async error handler wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFound,
  AppError,
  asyncHandler,
  logger,
};