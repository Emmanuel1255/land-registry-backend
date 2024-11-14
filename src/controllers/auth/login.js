// src/controllers/auth/login.js
const { User } = require('../../models');
const jwt = require('jsonwebtoken');

exports.login = asyncHandler(async (req, res) => {
  try {
    const { user, token } = await authService.login(req.body);
    res.json({ 
      success: true,
      user, 
      token 
    });
  } catch (error) {
    console.error('Login controller error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
});