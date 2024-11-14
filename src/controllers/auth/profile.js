// src/controllers/auth/profile.js
const { User } = require('../../models');
const { uploadToCloudinary } = require('../../config/cloudinary');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching profile'
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
      const { firstName, lastName, phoneNumber, address } = req.body;
      const updateData = { firstName, lastName, phoneNumber, address };

      // Handle profile picture upload if present
      if (req.file) {
          const result = await uploadToCloudinary(req.file.path, 'profiles');
          updateData.profilePicture = result.url;
      }

      const user = await User.findByIdAndUpdate(
          req.user.id,
          { $set: updateData },
          { new: true }
      );

      res.json(user);
  } catch (error) {
      res.status(500).json({
          message: 'Error updating profile'
      });
  }
  
};

exports.changePassword = asyncHandler(async (req, res) => {
  const result = await authService.changePassword(req.user.id, {
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword
  });
  
  res.json(result);
});