// src/controllers/verification/index.js
const VerificationService = require('../../services/verification.service');

// Export the controller functions directly
exports.submitVerification = async (req, res, next) => {
  try {
      console.log('Request body:', req.body); // Add this debug log
      
      const verification = await VerificationService.submitVerification({
          propertyId: req.body.propertyId, // Make sure this matches
          documents: req.files,
          verifierId: req.user.id,
          ...req.body
      });
      
      res.status(201).json(verification);
  } catch (error) {
      if (error.statusCode === 404) {
          return res.status(404).json({ message: error.message });
      }
      next(error);
  }
};

exports.getVerification = async (req, res, next) => {
  try {
    const verification = await VerificationService.getVerification(req.params.id);
    res.json(verification);
  } catch (error) {
    next(error);
  }
};

exports.approveVerification = async (req, res, next) => {
  try {
    const verification = await VerificationService.approveVerification(
      req.params.id,
      req.body,
      req.file,
      req.user.id
    );
    res.json(verification);
  } catch (error) {
    next(error);
  }
};

exports.checkStatus = async (req, res, next) => {
  try {
    const status = await VerificationService.checkStatus(req.params.propertyId);
    res.json(status);
  } catch (error) {
    next(error);
  }
};