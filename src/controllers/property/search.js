// src/controllers/property/search.js
exports.searchProperties = async (req, res) => {
    try {
      const {
        query,
        type,
        minPrice,
        maxPrice,
        location,
        status,
        page = 1,
        limit = 10
      } = req.query;
  
      const searchQuery = {};
  
      if (query) {
        searchQuery.$or = [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ];
      }
  
      if (type) searchQuery.type = type;
      if (status) searchQuery.status = status;
      if (location) searchQuery['location.area'] = { $regex: location, $options: 'i' };
      if (minPrice || maxPrice) {
        searchQuery.price = {};
        if (minPrice) searchQuery.price.$gte = minPrice;
        if (maxPrice) searchQuery.price.$lte = maxPrice;
      }
  
      const properties = await Property.find(searchQuery)
        .populate('owner', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
  
      const total = await Property.countDocuments(searchQuery);
  
      res.json({
        properties,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error searching properties'
      });
    }
  };