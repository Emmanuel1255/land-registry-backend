// src/controllers/auth/register.js
const authService = require('../../services/auth.service');
const { asyncHandler } = require('../../middleware/error');

exports.register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  res.status(201).json({ user, token });
});