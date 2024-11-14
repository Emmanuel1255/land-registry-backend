// src/controllers/verification/submit.js
const { Verification, Property } = require('../../models');

exports.submitVerification = async (req, res) => {
  try {
    const {
      propertyId,
      lsNumber,
      pageNumber,
      volumeNumber,
      comments
    } = req.body;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        message: 'Property not found'
      });
    }

    // Handle document uploads
    const documents = [];
    if (req.files) {
      for (const [key, files] of Object.entries(req.files)) {
        for (const file of files) {
          const result = await uploadToCloudinary(file.path, 'verifications');
          documents.push({
            type: key,
            url: result.url,
            publicId: result.publicId,
          });
        }
      }
    }

    // Create verification request
    const verification = await Verification.create({
      property: propertyId,
      verifier: req.user.id,
      lsNumber,
      pageNumber,
      volumeNumber,
      comments,
      documents
    });

    // Update property status
    await Property.findByIdAndUpdate(propertyId, {
      verificationStatus: 'pending',
      $push: {
        history: {
          action: 'verification_submitted',
          performedBy: req.user.id,
          details: { verificationId: verification._id }
        }
      }
    });

    res.status(201).json(verification);
  } catch (error) {
    res.status(500).json({
      message: 'Error submitting verification'
    });
  }
};