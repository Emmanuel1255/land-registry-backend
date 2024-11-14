// src/middleware/validate.js
const Joi = require('joi');

const validationSchemas = {
  registration: Joi.object({
    firstName: Joi.string().required().min(2).max(50),
    lastName: Joi.string().required().min(2).max(50),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6),
    phoneNumber: Joi.string().pattern(/^\+?[\d\s-]+$/),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  email: Joi.object({
    email: Joi.string().email().required()
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: Joi.string().required().min(6)
  }),
  changePassword: Joi.object({
    currentPassword: Joi.string().min(6).required().messages({
      'string.empty': 'Current password is required',
      'string.min': 'Current password should have at least 6 characters',
    }),
    newPassword: Joi.string().min(6).required().messages({
      'string.empty': 'New password is required',
      'string.min': 'New password should have at least 6 characters',
    })
  }),
  
  propertyCreation: Joi.object({
    title: Joi.string().required().min(3).max(100),
    description: Joi.string().required(),
    type: Joi.string().required().valid('residential', 'commercial', 'agricultural', 'industrial'),
    size: Joi.number().required().positive(),
    location: Joi.object({
      address: Joi.string().required(),
      area: Joi.string().required(),
      city: Joi.string().required(),
      coordinates: Joi.object({
        lat: Joi.number(),
        lng: Joi.number(),
      }),
    }).required(),
    price: Joi.number().required().positive(),
    lsNumber: Joi.string().pattern(/^LS\d{4}\/\d{4}$/),
    pageNumber: Joi.string(),
    volumeNumber: Joi.string(),
  }),

  propertyUpdate: Joi.object({
    title: Joi.string().min(3).max(100),
    description: Joi.string(),
    type: Joi.string().valid('residential', 'commercial', 'agricultural', 'industrial'),
    size: Joi.number().positive(),
    location: Joi.object({
      address: Joi.string(),
      area: Joi.string(),
      city: Joi.string(),
      coordinates: Joi.object({
        lat: Joi.number(),
        lng: Joi.number(),
      }),
    }),
    price: Joi.number().positive(),
  }),

  verificationSubmission: Joi.object({
    propertyId: Joi.string().required(),
    lsNumber: Joi.string().required().pattern(/^LS\d{4}\/\d{4}$/),
    pageNumber: Joi.string().required(),
    volumeNumber: Joi.string().required(),
    comments: Joi.string(),
  }),

  verificationApproval: Joi.object({
    status: Joi.string().required().valid('approved', 'rejected'),
    comments: Joi.string(),
    checks: Joi.object({
      surveyValid: Joi.object({
        status: Joi.boolean(),
        notes: Joi.string(),
      }),
      titleValid: Joi.object({
        status: Joi.boolean(),
        notes: Joi.string(),
      }),
      taxClearance: Joi.object({
        status: Joi.boolean(),
        notes: Joi.string(),
      }),
    }),
  }),
};

const validate = (schema) => {
  return (req, res, next) => {
    console.log('Request body:', req.body); // Log the incoming request body

    const { error } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });

    if (error) {
      const errorMessage = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      console.error('Validation error:', errorMessage); // Log validation errors

      return res.status(400).json({
        message: 'Validation error',
        errors: errorMessage,
      });
    }

    next();
  };
};


module.exports = {
  validate,
  validationSchemas,
};