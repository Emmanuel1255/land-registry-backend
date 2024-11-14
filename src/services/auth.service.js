// Backend: src/services/auth.service.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { AppError } = require('../middleware/error');

class AuthService {
  async register(userData) {
    try {
      const existingUser = await User.findOne({ email: userData.email });

      if (existingUser) {
        throw new AppError('User already exists', 400);
      }

      const user = await User.create(userData);

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1d' }
      );
      

      // Remove password from response
      const userObject = user.toObject();
      delete userObject.password;

      return { user: userObject, token };
    } catch (error) {
      throw error;
    }
  }

  async login(credentials) {
    try {
      const { email, password } = credentials;

      // Find user with password
      const user = await User.findOne({ email }).select('+password');

      console.log('Login attempt:', { email, userFound: !!user });

      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('Password validation:', { isValid: isPasswordValid });

      if (!isPasswordValid) {
        throw new AppError('Invalid credentials', 401);
      }

      // Generate token
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1d' }
      );

      // Remove password from response
      const userObject = user.toObject();
      delete userObject.password;

      return { user: userObject, token };
    } catch (error) {
      throw error;
    }
  }

  async getProfile(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        throw new AppError('User not found', 404);
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(userId, userData, profileImage = null) {
    try {
      // Prevent password update through this method
      if (userData.password) {
        delete userData.password;
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { ...userData },
        { new: true }
      ).select('-password');

      if (!user) {
        throw new AppError('User not found', 404);
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  generateToken(userId) {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        throw new AppError('User not found', 404);
      }

      return user;
    } catch (error) {
      throw new AppError('Invalid token', 401);
    }
  }

  async changePassword(userId, passwordData) {
    try {
      const { currentPassword, newPassword, confirmPassword } = passwordData;
  
      // Check if all required fields are present
      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new AppError('All password fields are required', 400);
      }
  
      // Ensure new password and confirm password match
      if (newPassword !== confirmPassword) {
        throw new AppError('New password and confirm password do not match', 400);
      }
  
      // Find user by ID with the password field included
      const user = await User.findById(userId).select('+password');
  
      if (!user) {
        throw new AppError('User not found', 404);
      }
  
      // Verify the current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        throw new AppError('Current password is incorrect', 401);
      }
  
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
  
      // Save the updated user
      await user.save();
  
      return { message: 'Password updated successfully' };
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  }
  
}

module.exports = new AuthService();