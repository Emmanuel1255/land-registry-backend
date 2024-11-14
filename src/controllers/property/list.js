// src/controllers/property/list.js
exports.listProperties = async (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const query = { owner: req.user.id };
  
      if (status) {
        query.status = status;
      }
  
      const properties = await Property.find(query)
        .populate('owner', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
  
      const total = await Property.countDocuments(query);
  
      res.json({
        properties,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching properties'
      });
    }
  };