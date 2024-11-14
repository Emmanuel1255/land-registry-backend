// src/utils/constants.js
const constants = {
    PROPERTY_TYPES: {
      RESIDENTIAL: 'residential',
      COMMERCIAL: 'commercial',
      AGRICULTURAL: 'agricultural',
      INDUSTRIAL: 'industrial',
    },
  
    PROPERTY_STATUS: {
      PENDING: 'pending',
      REGISTERED: 'registered',
      REJECTED: 'rejected',
    },
  
    VERIFICATION_STATUS: {
      UNVERIFIED: 'unverified',
      PENDING: 'pending',
      VERIFIED: 'verified',
    },
  
    TRANSFER_STATUS: {
      PENDING: 'pending',
      PROCESSING: 'processing',
      COMPLETED: 'completed',
      REJECTED: 'rejected',
    },
  
    USER_ROLES: {
      USER: 'user',
      ADMIN: 'admin',
      VERIFIER: 'verifier',
    },
  
    DOCUMENT_TYPES: {
      DEED: 'deed',
      SURVEY: 'survey',
      TAX: 'tax',
      IDENTITY: 'identity',
      OTHER: 'other',
    },
  
    PAYMENT_METHODS: {
      BANK_TRANSFER: 'bank_transfer',
      MOBILE_MONEY: 'mobile_money',
      CASH: 'cash',
    },
  
    // API response messages
    MESSAGES: {
        AUTH: {
          INVALID_CREDENTIALS: 'Invalid email or password',
          UNAUTHORIZED: 'You are not authorized to perform this action',
          TOKEN_EXPIRED: 'Your session has expired. Please login again',
          REGISTRATION_SUCCESS: 'Registration successful',
          PASSWORD_RESET_SENT: 'Password reset instructions sent to your email',
          PASSWORD_RESET_SUCCESS: 'Password reset successful',
        },
        PROPERTY: {
          NOT_FOUND: 'Property not found',
          CREATED: 'Property created successfully',
          UPDATED: 'Property updated successfully',
          DELETED: 'Property deleted successfully',
          DOCUMENT_UPLOADED: 'Documents uploaded successfully',
        },
        VERIFICATION: {
          SUBMITTED: 'Verification request submitted successfully',
          APPROVED: 'Verification approved successfully',
          REJECTED: 'Verification rejected',
          IN_PROGRESS: 'Verification in progress',
          INVALID: 'Invalid verification request',
        },
        TRANSFER: {
          INITIATED: 'Transfer initiated successfully',
          APPROVED: 'Transfer approved successfully',
          COMPLETED: 'Transfer completed successfully',
          REJECTED: 'Transfer rejected',
          INVALID: 'Invalid transfer request',
        },
        DOCUMENT: {
          UPLOAD_SUCCESS: 'Document uploaded successfully',
          UPLOAD_ERROR: 'Error uploading document',
          INVALID_TYPE: 'Invalid document type',
          SIZE_LIMIT: 'Document size exceeds limit',
        },
      },
    
      // Validation constraints
      VALIDATION: {
        PASSWORD_MIN_LENGTH: 6,
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
        MAX_TITLE_LENGTH: 100,
        MAX_DESCRIPTION_LENGTH: 1000,
      },
    
      // Pagination defaults
      PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100,
      },
    };
    
    // Add regex patterns
    constants.PATTERNS = {
      EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      PHONE: /^\+?[\d\s-]{10,}$/,
      LS_NUMBER: /^LS\d{4}\/\d{4}$/,
      COORDINATES: /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/,
    };
    
    module.exports = constants;