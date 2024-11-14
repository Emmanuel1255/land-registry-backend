// src/models/Verification.js
const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: [true, 'Property reference is required'],
    },
    verifier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
  },
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'verified',
    },
    lsNumber: {
        type: String,
        required: [true, 'LS Number is required'],
        match: [/^LS\d{4}\/\d{4}$/, 'Please provide a valid LS Number (e.g., LS1234/2024)']
    },
    pageNumber: {
        type: String,
        required: [true, 'Page number is required'],
        trim: true
    },
    volumeNumber: {
        type: String,
        required: [true, 'Volume number is required'],
        trim: true
    },
    lawyerId: {
        type: String,
        required: [true, 'Lawyer ID is required'],
        trim: true
    },
    documents: [{
        type: {
            type: String,
            enum: ['survey', 'legal', 'tax', 'other'],
            required: true
        },
        name: {
            type: String,
            trim: true
        },
        url: {
            type: String,
            required: true
        },
        publicId: {
            type: String,
            required: true
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    comments: {
        type: String,
        trim: true,
        maxLength: [1000, 'Comments cannot be more than 1000 characters']
    },
    signature: {
        url: {
            type: String,
            trim: true
        },
        timestamp: {
            type: Date
        }
    },
    checks: {
        surveyValid: {
            status: {
                type: Boolean,
                default: false
            },
            notes: {
                type: String,
                trim: true
            },
            verifiedAt: {
                type: Date
            }
        },
        titleValid: {
            status: {
                type: Boolean,
                default: false
            },
            notes: {
                type: String,
                trim: true
            },
            verifiedAt: {
                type: Date
            }
        },
        taxClearance: {
            status: {
                type: Boolean,
                default: false
            },
            notes: {
                type: String,
                trim: true
            },
            verifiedAt: {
                type: Date
            }
        }
    },
    verificationDate: {
        type: Date,
        default: Date.now
    },
    history: [{
        action: {
            type: String,
            enum: ['created', 'updated', 'approved', 'rejected'],
            required: true
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        details: {
            type: Object
        }
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
verificationSchema.index({ property: 1, status: 1 });
verificationSchema.index({ lsNumber: 1 }, { unique: true });
verificationSchema.index({ verifier: 1, createdAt: -1 });

// Virtual for verification age
verificationSchema.virtual('age').get(function() {
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to update verification date
verificationSchema.pre('save', function(next) {
    if (this.isModified('status') && this.status === 'approved') {
        this.verificationDate = Date.now();
    }
    next();
});

// Instance method to check if verification is complete
verificationSchema.methods.isVerificationComplete = function() {
    return this.checks.surveyValid.status &&
           this.checks.titleValid.status &&
           this.checks.taxClearance.status;
};

// Static method to find pending verifications
verificationSchema.statics.findPendingVerifications = function() {
    return this.find({ status: 'pending' })
        .populate('property')
        .populate('verifier')
        .sort('-createdAt');
};

// Static method to get verification statistics
verificationSchema.statics.getVerificationStats = async function() {
    return this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);
};

const Verification = mongoose.model('Verification', verificationSchema);

// Add error handling middleware
Verification.createVerification = async function(verificationData) {
    try {
        const verification = new Verification(verificationData);
        await verification.validate();
        return await verification.save();
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            throw new Error(`Validation Error: ${errors.join(', ')}`);
        }
        throw error;
    }
};

module.exports = Verification;