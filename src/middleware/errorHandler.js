// src/middleware/errorHandler.js
const errorHandler = (error, req, res, next) => {
    console.error('Error:', error);
  
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation Error',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
  
    if (error.name === 'AppError') {
      return res.status(error.statusCode || 400).json({
        message: error.message
      });
    }
  
    // Handle file upload errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File is too large'
      });
    }
  
    // Default error
    return res.status(500).json({
      message: 'Internal server error'
    });
  };
  
  module.exports = errorHandler;