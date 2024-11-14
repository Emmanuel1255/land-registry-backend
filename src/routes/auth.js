// src/routes/auth.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { validate, validationSchemas } = require('../middleware/validate');
const authController = require('../controllers/auth');
const { uploadConfigs } = require('../middleware/upload');

// Authentication routes
router.post(
    '/register', 
    validate(validationSchemas.registration),
    authController.register
);

router.post(
    '/login', 
    validate(validationSchemas.login),
    authController.login
);

router.get(
    '/profile', 
    auth, 
    authController.getProfile
);

router.put(
    '/profile',
    auth,
    uploadConfigs.profilePicture,
    authController.updateProfile
);

router.post(
    '/forgot-password',
    validate(validationSchemas.email),
    authController.forgotPassword
);

router.post(
    '/reset-password',
    validate(validationSchemas.resetPassword),
    authController.resetPassword
);

router.post('/change-password',
    auth,  // Add auth middleware to protect the route
    async (req, res) => {
      try {
        const result = await authController.changePassword(req, res);
        return result;
      } catch (error) {
        return res.status(500).json({ 
          success: false, 
          message: error.message 
        });
      }
    }
  );

module.exports = router;