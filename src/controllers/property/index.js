// src/controllers/property/index.js
const PropertyService = require('../../services/property.service');

const propertyController = {
  async createProperty(req, res, next) {
    try {
      const property = await PropertyService.createProperty(
        req.body,
        req.files,
        req.user.id
      );
      res.status(201).json(property);
    } catch (error) {
      next(error);
    }
  },

  async listProperties(req, res, next) {
    try {
      const properties = await PropertyService.listProperties(req.user.id);
      res.json(properties);
    } catch (error) {
      next(error);
    }
  },

  async getProperty(req, res, next) {
    try {
      const property = await PropertyService.getProperty(req.params.id);
      res.json(property);
    } catch (error) {
      next(error);
    }
  },

  async updateProperty(req, res, next) {
    try {
      const property = await PropertyService.updateProperty(
        req.params.id,
        req.body,
        req.files,
        req.user.id
      );
      res.json(property);
    } catch (error) {
      next(error);
    }
  },

  async searchProperties(req, res, next) {
    try {
      const properties = await PropertyService.searchProperties(req.query);
      res.json(properties);
    } catch (error) {
      next(error);
    }
  },

  async uploadDocuments(req, res, next) {
    try {
      const property = await PropertyService.uploadDocuments(
        req.params.id,
        req.files,
        req.user.id
      );
      res.json(property);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = propertyController;