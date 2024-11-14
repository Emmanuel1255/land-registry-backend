// src/controllers/transfer/approve.js
const { Transfer, Property } = require('../../models');
const { uploadToCloudinary } = require('../../config/cloudinary');
const { AppError } = require('../../middleware/error');

exports.approveTransfer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, signature } = req.body;

    const transfer = await Transfer.findById(id);
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    // Validate approver's role
    let isAuthorized = false;
    switch (role) {
      case 'buyer':
        isAuthorized = transfer.toOwner.toString() === req.user.id;
        break;
      case 'verifier':
        isAuthorized = req.user.role === 'verifier';
        break;
      default:
        return res.status(400).json({ message: 'Invalid approval role' });
    }

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to approve this transfer' });
    }

    // Upload signature if provided
    let signatureUrl = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, 'signatures');
      signatureUrl = result.url;
    }

    // Update approvals
    transfer.approvals[role] = {
      approved: true,
      signature: signatureUrl,
      timestamp: new Date()
    };

    // Check if all required approvals are complete
    const allApproved = ['seller', 'buyer', 'verifier'].every(
      role => transfer.approvals[role]?.approved
    );

    if (allApproved) {
      transfer.status = 'completed';
      transfer.transferDate = new Date();

      // Update property ownership
      await Property.findByIdAndUpdate(transfer.property, {
        owner: transfer.toOwner,
        $push: {
          history: {
            action: 'transfer_completed',
            performedBy: req.user.id,
            details: { transferId: transfer._id }
          }
        }
      });
    }

    await transfer.save();
    res.json(transfer);
  } catch (error) {
    next(error);
  }
};