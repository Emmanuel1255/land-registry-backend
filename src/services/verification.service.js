// src/services/verification.service.js
const { Verification, Property, User } = require('../models');
const { AppError } = require('../middleware/error');

class VerificationService {
  async submitVerification(data) {
    try {
        // Find and verify property exists
        const property = await Property.findById(data.propertyId);
        if (!property) {
            throw new AppError('Property not found', 404);
        }

        // Find and verify user exists (verifier)
        const verifier = await User.findById(data.verifierId);
        if (!verifier) {
            throw new AppError('Verifier not found', 404);
        }

        // Create verification record
        const verificationData = {
            property: data.propertyId,
            verifier: data.verifierId,
            lsNumber: data.lsNumber,
            pageNumber: data.pageNumber,
            volumeNumber: data.volumeNumber,
            lawyerId: data.lawyerId,
            status: 'verified',
            documents: data.documents || [],
            checks: {
                surveyValid: {
                    status: true,
                    notes: 'Survey plan verified successfully',
                    verifiedAt: new Date()
                },
                titleValid: {
                    status: true,
                    notes: 'Title documents verified successfully',
                    verifiedAt: new Date()
                },
                taxClearance: {
                    status: true,
                    notes: 'Tax clearance verified successfully',
                    verifiedAt: new Date()
                }
            },
            verificationDate: new Date(),
            history: [{
                action: 'created',
                performedBy: data.verifierId,
                timestamp: new Date(),
                details: {
                    status: 'verified',
                    method: 'initial_verification'
                }
            }]
        };

        // Create the verification record
        const verification = await Verification.create(verificationData);

        // Populate the verification with related data
        const populatedVerification = await Verification.findById(verification._id)
            .populate('verifier', 'firstName lastName email')
            .populate('property', 'title location price');

        // Update property verification status
        await Property.findByIdAndUpdate(data.propertyId, {
            verificationStatus: 'verified',
            lsNumber: data.lsNumber,
            pageNumber: data.pageNumber,
            volumeNumber: data.volumeNumber,
            $push: {
                history: {
                    action: 'verification_completed',
                    performedBy: data.verifierId,
                    timestamp: new Date(),
                    details: {
                        verificationId: verification._id,
                        lsNumber: data.lsNumber,
                        verificationDate: new Date()
                    }
                }
            }
        }, { new: true });

        // Format the response
        const response = {
            ...populatedVerification.toObject(),
            verificationDetails: {
                completedAt: new Date(),
                verifiedBy: {
                    id: verifier._id,
                    name: `${verifier.firstName} ${verifier.lastName}`,
                    email: verifier.email
                }
            },
            checks: {
                survey: {
                    status: 'verified',
                    message: 'Survey plan has been verified successfully',
                    verifiedAt: new Date()
                },
                oarg: {
                    status: 'verified',
                    message: 'OARG records have been verified successfully',
                    verifiedAt: new Date()
                },
                lawyer: {
                    status: 'verified',
                    message: 'Legal verification completed successfully',
                    verifiedAt: new Date()
                }
            }
        };

        // Remove sensitive or unnecessary fields
        delete response.__v;
        if (response.verifier) {
            delete response.verifier.password;
            delete response.verifier.__v;
        }

        return response;

    } catch (error) {
        // Log the error for debugging
        console.error('Verification submission error:', error);

        // Handle specific error types
        if (error.name === 'ValidationError') {
            throw new AppError('Validation failed: ' + Object.values(error.errors).map(err => err.message).join(', '), 400);
        }

        if (error.name === 'CastError') {
            throw new AppError('Invalid ID format', 400);
        }

        // Rethrow AppError instances
        if (error instanceof AppError) {
            throw error;
        }

        // Handle any other errors
        throw new AppError(error.message || 'Error submitting verification', 400);
    }
}

// Add these utility methods to the class
async getVerification(id) {
    const verification = await Verification.findById(id)
        .populate('verifier', 'firstName lastName email')
        .populate('property', 'title location price');

    if (!verification) {
        throw new AppError('Verification not found', 404);
    }

    return verification;
}

async checkStatus(propertyId) {
    const verification = await Verification.findOne({ property: propertyId })
        .sort({ createdAt: -1 })
        .populate('verifier', 'firstName lastName email')
        .populate('property', 'title location price');

    if (!verification) {
        throw new AppError('No verification found for this property', 404);
    }

    return verification;
}

  async approveVerification(id, data, signature, userId) {
    const verification = await Verification.findById(id);
    if (!verification) {
      throw new AppError('Verification not found', 404);
    }

    verification.status = data.status;
    verification.comments = data.comments;
    await verification.save();

    return verification;
  }
}

// Export a new instance of the service
module.exports = new VerificationService();