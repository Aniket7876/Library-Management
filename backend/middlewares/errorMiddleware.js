class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorMiddleware = (err, req, res, next) => {
  err.message = err.message || 'Internal Server Error';
  err.statusCode = err.statusCode || 500;

  // Log error for server-side debugging (only stack trace in development)
  const errorLog =
    process.env.NODE_ENV === 'production'
      ? { message: err.message, statusCode: err.statusCode, path: req.path }
      : { message: err.message, statusCode: err.statusCode, stack: err.stack, path: req.path };

  console.error(JSON.stringify(errorLog, null, 2));

  // Handle specific error types
  if (err.code === 11000) {
    const statusCode = 400;
    const message = `Duplicate field value entered`;
    err = new ErrorHandler(message, statusCode);
  }

  if (err.name === 'JsonWebTokenError') {
    const statusCode = 401;
    const message = 'Invalid authentication token';
    err = new ErrorHandler(message, statusCode);
  }

  if (err.name === 'TokenExpiredError') {
    const statusCode = 401;
    const message = 'Authentication token has expired';
    err = new ErrorHandler(message, statusCode);
  }

  if (err.name === 'CastError') {
    const statusCode = 400;
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, statusCode);
  }

  // Handle validation errors from Mongoose
  if (err.name === 'ValidationError') {
    const statusCode = 400;
    const message = Object.values(err.errors)
      .map((error) => error.message)
      .join('. ');
    err = new ErrorHandler(message, statusCode);
  }

  // Final error response
  const errorResponse = {
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  return res.status(err.statusCode).json(errorResponse);
};

export default ErrorHandler;
