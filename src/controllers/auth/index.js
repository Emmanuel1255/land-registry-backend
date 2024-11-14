// src/controllers/auth/index.js
const AuthService = require('../../services/auth.service');
const { AppError } = require('../../middleware/error');

const authController = {
  async register(req, res, next) {
    try {
      const { user, token } = await AuthService.register(req.body);
      res.status(201).json({ user, token });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      // Pass the entire credentials object
      const { user, token } = await AuthService.login(req.body);
      res.json({ 
        success: true,
        user, 
        token 
      });
    } catch (error) {
      // Send a more specific error response
      res.status(401).json({
        success: false,
        message: error.message || 'Invalid credentials'
      });
    }
  },

  async getProfile(req, res, next) {
    try {
      const user = await AuthService.getProfile(req.user.id);
      res.json({ success: true, user });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const updatedUser = await AuthService.updateProfile(req.user.id, req.body, req.file);
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      next(error);
    }
  },

  async forgotPassword(req, res, next) {
    try {
      await AuthService.forgotPassword(req.body.email);
      res.json({ success: true, message: 'Password reset email sent' });
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req, res, next) {
    try {
      await AuthService.resetPassword(req.body.token, req.body.password);
      res.json({ success: true, message: 'Password reset successful' });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req, res) {
    try {
      const result = await AuthService.changePassword(req.user.id, req.body);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error changing password'
      });
    }
  }
};

module.exports = authController;