// src/routes/user.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');  // Add this import

router.get('/search', auth, async (req, res) => {
  try {
    const { search, exclude } = req.query;
    const query = {};

    // Add search filter if search term exists
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Fix exclude filter handling
    if (exclude && exclude !== 'undefined') {
      try {
        // Handle both string and array formats
        const excludeIds = typeof exclude === 'string' ? exclude.split(',') : exclude;
        if (excludeIds.length > 0) {
          query._id = { $nin: excludeIds };
        }
      } catch (error) {
        console.error('Error processing exclude ids:', error);
      }
    }

    const users = await User.find(query)
      .select('firstName lastName email _id')  // Make sure to select _id
      .limit(10);

    res.json({ users });
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ 
      message: 'Error fetching users',
      error: error.message 
    });
  }
});

module.exports = router;