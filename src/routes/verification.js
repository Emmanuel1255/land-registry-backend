// src/routes/verification.js
const express = require('express');
const router = express.Router();

// Import controller directly from the file
const verificationController = require('../controllers/verification');
console.log('Verification Controller:', verificationController); // Debug log

// Import middleware
const { auth } = require('../middleware/auth');
const { uploadConfigs } = require('../middleware/upload');

// Basic route first to test
router.get('/test', (req, res) => {
  res.json({ message: 'Verification route working' });
});

// Now add the main routes
router.post('/submit', 
  auth, 
  uploadConfigs.verificationDocs, 
  async (req, res, next) => {
    try {
      await verificationController.submitVerification(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id', 
  auth, 
  async (req, res, next) => {
    try {
      await verificationController.getVerification(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id/approve', 
  auth, 
  uploadConfigs.signature, 
  async (req, res, next) => {
    try {
      await verificationController.approveVerification(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/property/:propertyId', 
  auth, 
  async (req, res, next) => {
    try {
      await verificationController.checkStatus(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;