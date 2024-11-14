// src/services/user.service.js
const User = require('../models/User');
const { AppError } = require('../middleware/error');

class UserService {
  async searchUsers(searchTerm, excludeIds = []) {
    try {
      const query = {};
      
      if (searchTerm) {
        query.$or = [
          { firstName: { $regex: searchTerm, $options: 'i' } },
          { lastName: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } }
        ];
      }

      if (excludeIds.length > 0) {
        query._id = { $nin: excludeIds };
      }

      const users = await User.find(query)
        .select('firstName lastName email')
        .limit(10);

      return users;
    } catch (error) {
      throw new AppError('Error searching users', 500);
    }
  }

  async getUserById(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        throw new AppError('User not found', 404);
      }
      return user;
    } catch (error) {
      throw new AppError('Error fetching user', 500);
    }
  }
}

module.exports = new UserService();