// src/controllers/transfer/complete.js
const { Transfer, Property } = require('../../models');
const { uploadToCloudinary } = require('../../config/cloudinary');
const { AppError } = require('../../middleware/error');

exports.completeTransfer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentConfirmation } = req.body;

    const transfer = await Transfer.findById(id);
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    if (transfer.status !== 'processing') {
      return res.status(400).json({ message: 'Transfer is not in processing state' });
    }

    // Upload payment confirmation documents
    const documents = [];
    if (req.files) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.path, 'payments');
        documents.push({
          type: 'payment_proof',
          url: result.url,
          publicId: result.publicId,
          uploadedAt: new Date()
        });
      }
    }

    // Update transfer
    transfer.status = 'completed';
    transfer.transferDate = new Date();
    transfer.documents.push(...documents);
    transfer.paymentDetails = {
      ...transfer.paymentDetails,
      ...paymentConfirmation,
      confirmedAt: new Date()
    };

    await transfer.save();

    // Update property ownership
    await Property.findByIdAndUpdate(transfer.property, {
      owner: transfer.toOwner,
      status: 'registered',
      $push: {
        history: {
          action: 'transfer_completed',
          performedBy: req.user.id,
          details: { transferId: transfer._id }
        }
      }
    });

    res.json(transfer);
  } catch (error) {
    next(error);
  }
};