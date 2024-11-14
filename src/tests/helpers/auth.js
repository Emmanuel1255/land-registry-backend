// src/tests/helpers/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../../models');

const createTestUser = async (userData = {}) => {
  const defaultUser = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'password123',
    role: 'user',
  };

  const user = await User.create({ ...defaultUser, ...userData });
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET
  );

  return { user, token };
};

const createTestAdmin = async () => {
  return createTestUser({
    email: 'admin@example.com',
    role: 'admin',
  });
};

const createTestVerifier = async () => {
  return createTestUser({
    email: 'verifier@example.com',
    role: 'verifier',
  });
};

module.exports = {
  createTestUser,
  createTestAdmin,
  createTestVerifier,
};