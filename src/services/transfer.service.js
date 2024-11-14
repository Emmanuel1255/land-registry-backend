// src/services/transfer.service.js
const { Transfer, Property } = require('../models');
const { AppError } = require('../middleware/error');

class TransferService {
  async initiateTransfer(data) {
    // Verify property exists
    const property = await Property.findById(data.propertyId);
    if (!property) {
      throw new AppError('Property not found', 404);
    }

    // Create transfer record
    const transfer = await Transfer.create({
      property: data.propertyId,
      fromOwner: data.fromOwnerId,
      toOwner: data.toOwnerId,
      transferAmount: data.transferAmount,
      status: 'pending',
      documents: []
    });

    return transfer;
  }

  async approveTransfer(id, data, userId) {
    const transfer = await Transfer.findById(id);
    if (!transfer) {
      throw new AppError('Transfer not found', 404);
    }

    transfer.status = 'approved';
    transfer.approvedBy = userId;
    transfer.approvedAt = new Date();

    await transfer.save();
    return transfer;
  }

  async completeTransfer(id, data, files, userId) {
    const transfer = await Transfer.findById(id);
    if (!transfer) {
      throw new AppError('Transfer not found', 404);
    }

    transfer.status = 'completed';
    await transfer.save();
    return transfer;
  }

  async listTransfers(userId) {
    return Transfer.find({
      $or: [
        { fromOwner: userId },
        { toOwner: userId }
      ]
    }).populate('property');
  }
}

module.exports = new TransferService();