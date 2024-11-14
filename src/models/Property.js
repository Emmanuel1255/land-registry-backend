// src/models/Property.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');



const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Property title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Property description is required'],
  },
  type: {
    type: String,
    required: [true, 'Property type is required'],
    enum: ['residential', 'commercial', 'agricultural', 'industrial'],
  },
  size: {
    type: Number,
    required: [true, 'Property size is required'],
    min: [0, 'Size cannot be negative'],
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    area: {
      type: String,
      required: [true, 'Area is required'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  status: {
    type: String,
    enum: ['available', 'pending_transfer', 'transferred', 'registered'],
    default: 'available'
  },
  verificationStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified'],
    default: 'unverified',
  },
  documents: [{
    name: String,
    type: {
      type: String,
      enum: ['deed', 'survey', 'tax', 'identity', 'other'],
    },
    url: String,
    publicId: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  lsNumber: {
    type: String,
    unique: true,
    sparse: true  // Only enforce uniqueness if the field exists
  },
  pageNumber: String,
  volumeNumber: String,
  images: [{
    url: String,
    publicId: String,
    isMain: {
      type: Boolean,
      default: false
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  history: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'verified', 'transferred'],
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    details: Object,
  }],
}, {
  timestamps: true,
});

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;