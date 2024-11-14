// src/controllers/transfer/initiate.js
const { Transfer, Property, User } = require('../../models');
const { uploadToCloudinary } = require('../../config/cloudinary');
const { AppError } = require('../../middleware/error');

exports.initiateTransfer = async (req, res, next) => {
  try {
    const {
      propertyId,
      toOwnerId,
      transferAmount,
      paymentDetails
    } = req.body;

    // Verify property and ownership
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to transfer this property' });
    }

    // Verify recipient exists
    const recipient = await User.findById(toOwnerId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Handle document uploads
    const documents = [];
    if (req.files) {
      for (const [key, files] of Object.entries(req.files)) {
        for (const file of files) {
          const result = await uploadToCloudinary(file.path, 'transfers');
          documents.push({
            type: key,
            url: result.url,
            publicId: result.publicId,
            uploadedAt: new Date()
          });
        }
      }
    }

    // Create transfer record
    const transfer = await Transfer.create({
      property: propertyId,
      fromOwner: req.user.id,
      toOwner: toOwnerId,
      transferAmount,
      documents,
      paymentDetails,
      approvals: {
        seller: {
          approved: true,
          timestamp: new Date()
        }
      }
    });

    // Update property status
    await Property.findByIdAndUpdate(propertyId, {
      status: 'pending_transfer',
      $push: {
        history: {
          action: 'transfer_initiated',
          performedBy: req.user.id,
          details: { transferId: transfer._id }
        }
      }
    });

    res.status(201).json(transfer);
  } catch (error) {
    next(error);
  }
};