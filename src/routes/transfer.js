// src/routes/transfer.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { uploadConfigs, handleUploadError } = require('../middleware/upload');
const transferController = require('../controllers/transfer');

// Transfer initiation
router.post('/initiate', 
  auth, 
  transferController.initiateTransfer
);

// Document upload
router.post('/:transferId/documents',
  auth,
  uploadConfigs.transferDocs,
  handleUploadError,
  transferController.uploadDocuments
);

// Document deletion
router.delete('/:transferId/documents/:documentId',
  auth,
  transferController.deleteDocument
);

// Transfer update
router.put('/:transferId',
  auth,
  uploadConfigs.transferDocs,
  handleUploadError,
  transferController.updateTransfer
);

// Transfer completion
router.post('/:transferId/complete',
  auth,
  uploadConfigs.transferDocs,
  handleUploadError,
  transferController.completeTransfer
);

// List transfers
router.get('/list',
  auth,
  transferController.listTransfers
);

// Get single transfer
router.get('/:transferId',
  auth,
  transferController.getTransfer
);

module.exports = router;