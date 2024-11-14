// src/models/Transfer.js
const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  fromOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toOwnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toOwnerDetails: {
    name: {
      type: String,
      required: true
    },
    identification: {
      type: String,
      required: true
    },
    contact: {
      type: String,
      required: true
    }
  },
  documents: [{
    type: {
      type: String,
      enum: ['transfer_deed', 'supporting_document', 'payment_proof'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  transferReason: {
    type: String,
    required: true
  },
  agreementDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'rejected'],
    default: 'pending'
  },
  transferAmount: {
    type: Number
  },
  paymentDetails: {
    method: String,
    transactionId: String,
    amount: Number,
    paidAt: Date
  },
  approvals: {
    seller: {
      approved: Boolean,
      signature: String,
      timestamp: Date
    }
  },
  transferDate: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Transfer', transferSchema);