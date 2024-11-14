// src/controllers/verification/status.js
exports.checkStatus = async (req, res) => {
    try {
      const { propertyId } = req.params;
  
      const verification = await Verification.findOne({ property: propertyId })
        .sort({ createdAt: -1 })
        .populate('verifier', 'firstName lastName email');
  
      if (!verification) {
        return res.status(404).json({
          message: 'No verification found for this property'
        });
      }
  
      res.json(verification);
    } catch (error) {
      res.status(500).json({
        message: 'Error checking verification status'
      });
    }
  };