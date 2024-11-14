// src/middleware/upload.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinary');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'land-registry',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
        resource_type: 'auto',
    },
});

// File filter function
const fileFilter = (req, file, cb) => {
    const imageTypes = ['image/jpeg', 'image/png'];
    const documentTypes = [...imageTypes, 'application/pdf'];
    
    switch (file.fieldname) {
        case 'images':
        case 'profilePicture':
        case 'signature':
            if (!imageTypes.includes(file.mimetype)) {
                return cb(new Error(`Invalid file type for ${file.fieldname}. Only JPG and PNG allowed`), false);
            }
            break;
            
        case 'documents':
        case 'deed':
        case 'surveyPlan':
        case 'identity':
        case 'tax':
        case 'other':
        case 'transferDeed':
        case 'paymentProof':
        case 'verificationProof':
        case 'supportingDocs':
            if (!documentTypes.includes(file.mimetype)) {
                return cb(new Error(`Invalid file type for ${file.fieldname}. Only PDF, JPG and PNG allowed`), false);
            }
            break;
            
        default:
            return cb(new Error('Invalid field name'), false);
    }
    
    cb(null, true);
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 5 // Maximum number of files per upload
    },
});

// Upload configurations for different scenarios
const uploadConfigs = {
    // Property related uploads
    propertyDocs: upload.fields([
        { name: 'images', maxCount: 5 },
        { name: 'deed', maxCount: 1 },
        { name: 'surveyPlan', maxCount: 1 },
        { name: 'identity', maxCount: 1 },
        { name: 'tax', maxCount: 1 },
        { name: 'other', maxCount: 5 }
    ]),

    propertyImages: upload.array('images', 5),

    // Transfer related uploads
    transferDocs: upload.fields([
        { name: 'documents', maxCount: 5 },
        { name: 'transferDeed', maxCount: 1 },
        { name: 'paymentProof', maxCount: 1 },
        { name: 'signature', maxCount: 1 }
    ]),

    // Single document uploads
    singleDocument: upload.single('document'),
    
    // Profile related uploads
    profilePicture: upload.single('profilePicture'),

    // Verification related uploads
    verificationDocs: upload.fields([
        { name: 'verificationProof', maxCount: 1 },
        { name: 'supportingDocs', maxCount: 3 }
    ]),

    // Signature upload
    signature: upload.single('signature'),
};

// Multer error handler
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    status: 'error',
                    message: 'File is too large. Maximum size is 10MB',
                    error: error.code
                });

            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    status: 'error',
                    message: 'Too many files uploaded',
                    error: error.code
                });

            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    status: 'error',
                    message: `Unexpected field name: ${error.field}`,
                    error: error.code
                });

            default:
                return res.status(400).json({
                    status: 'error',
                    message: 'Error uploading file',
                    error: error.code
                });
        }
    }

    if (error.message.includes('Invalid file type')) {
        return res.status(400).json({
            status: 'error',
            message: error.message,
            error: 'INVALID_FILE_TYPE'
        });
    }

    // For non-Multer errors
    console.error('Upload error:', error);
    return res.status(500).json({
        status: 'error',
        message: 'An unexpected error occurred during upload',
        error: error.message
    });
};

// Helper function to clean up uploaded files in case of error
const cleanupOnError = async (files) => {
    if (!files) return;

    const deleteFile = async (file) => {
        try {
            if (file.publicId) {
                await cloudinary.uploader.destroy(file.publicId);
            }
        } catch (error) {
            console.error('Error cleaning up file:', error);
        }
    };

    // Handle both single files and arrays of files
    if (Array.isArray(files)) {
        await Promise.all(files.map(deleteFile));
    } else if (typeof files === 'object') {
        await Promise.all(Object.values(files).flat().map(deleteFile));
    } else {
        await deleteFile(files);
    }
};

module.exports = {
    upload,
    uploadConfigs,
    handleUploadError,
    cleanupOnError
};