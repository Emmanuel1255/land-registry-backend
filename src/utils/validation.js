// src/utils/validation.js
const Joi = require('joi');

const userValidation = {
  registration: Joi.object({
    firstName: Joi.string().required().min(2).max(50),
    lastName: Joi.string().required().min(2).max(50),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6),
    phoneNumber: Joi.string().pattern(/^\+?[\d\s-]+$/),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  update: Joi.object({
    firstName: Joi.string().min(2).max(50),
    lastName: Joi.string().min(2).max(50),
    phoneNumber: Joi.string().pattern(/^\+?[\d\s-]+$/),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      postalCode: Joi.string(),
    }),
  }),
};

const propertyValidation = {
    creation: Joi.object({
      title: Joi.string()
        .required()
        .min(3)
        .max(constants.VALIDATION.MAX_TITLE_LENGTH)
        .trim(),
      
      description: Joi.string()
        .required()
        .max(constants.VALIDATION.MAX_DESCRIPTION_LENGTH)
        .trim(),
      
      type: Joi.string()
        .required()
        .valid(...Object.values(constants.PROPERTY_TYPES)),
      
      size: Joi.number()
        .required()
        .positive(),
      
      location: Joi.object({
        address: Joi.string().required(),
        area: Joi.string().required(),
        city: Joi.string().required(),
        coordinates: Joi.object({
          lat: Joi.number().min(-90).max(90),
          lng: Joi.number().min(-180).max(180),
        }),
      }).required(),
      
      price: Joi.number()
        .required()
        .positive(),
      
      lsNumber: Joi.string()
        .pattern(constants.PATTERNS.LS_NUMBER),
        
      documents: Joi.array().items(
        Joi.object({
          type: Joi.string().valid(...Object.values(constants.DOCUMENT_TYPES)),
          file: Joi.string(),
        })
      ),
    }),
  
    update: Joi.object({
      title: Joi.string()
        .min(3)
        .max(constants.VALIDATION.MAX_TITLE_LENGTH)
        .trim(),
      
      description: Joi.string()
        .max(constants.VALIDATION.MAX_DESCRIPTION_LENGTH)
        .trim(),
      
      price: Joi.number()
        .positive(),
      
      location: Joi.object({
        address: Joi.string(),
        area: Joi.string(),
        city: Joi.string(),
        coordinates: Joi.object({
          lat: Joi.number().min(-90).max(90),
          lng: Joi.number().min(-180).max(180),
        }),
      }),
    }),
  };

module.exports = {
  userValidation,
  propertyValidation,
};