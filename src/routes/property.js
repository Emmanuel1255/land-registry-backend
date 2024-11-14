// src/routes/property.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const propertyController = require('../controllers/property');
const { uploadConfigs, handleUploadError } = require('../middleware/upload');
const { validate, validationSchemas } = require('../middleware/validate');

// Property routes
router.post('/',
  auth,
  uploadConfigs.propertyDocs,
  handleUploadError,
  propertyController.createProperty
);

router.get(
  '/',
  auth,
  propertyController.listProperties
);

router.get(
  '/search',
  auth,
  propertyController.searchProperties
);

router.get(
  '/:id',
  auth,
  propertyController.getProperty
);

router.put(
  '/:id',
  auth,
  uploadConfigs.propertyDocs,
  validate(validationSchemas.propertyUpdate),
  propertyController.updateProperty
);

router.post(
  '/:id/documents',
  auth,
  uploadConfigs.propertyDocs,
  propertyController.uploadDocuments
);

module.exports = router;