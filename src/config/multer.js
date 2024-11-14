// src/config/multer.js
const multer = require('multer');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('./cloudinary');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'land-registry',
    allowed_formats: ['jpg', 'png', 'pdf', 'doc', 'docx'],
    resource_type: 'auto',
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedFileTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, PDF, and DOC files are allowed.'), false);
  }
};

// Configure multer with file size limits and file filter
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File is too large. Maximum size is 10MB'
      });
    }
    return res.status(400).json({
      message: `Upload error: ${error.message}`
    });
  }
  
  if (error) {
    return res.status(400).json({
      message: error.message
    });
  }
  
  next();
};

// Utility function to check file type
const getFileType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.pdf':
      return 'document';
    case '.doc':
    case '.docx':
      return 'document';
    case '.jpg':
    case '.jpeg':
    case '.png':
      return 'image';
    default:
      return 'unknown';
  }
};

module.exports = {
  upload,
  handleMulterError,
  getFileType,
  // Export specific upload configurations for different use cases
  uploadConfigs: {
    // For property documents
    propertyDocs: upload.fields([
      { name: 'deed', maxCount: 1 },
      { name: 'surveyPlan', maxCount: 1 },
      { name: 'titleDocument', maxCount: 1 },
      { name: 'additionalDocs', maxCount: 5 }
    ]),
    // For verification documents
    verificationDocs: upload.fields([
      { name: 'identityProof', maxCount: 1 },
      { name: 'verificationDocs', maxCount: 3 }
    ]),
    // For transfer documents
    transferDocs: upload.fields([
      { name: 'transferDeed', maxCount: 1 },
      { name: 'paymentProof', maxCount: 1 },
      { name: 'supportingDocs', maxCount: 3 }
    ]),
    // For single file uploads
    single: upload.single('file'),
    // For multiple files with the same field name
    multiple: upload.array('files', 5)
  }
};