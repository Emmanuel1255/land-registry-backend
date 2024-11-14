// src/controllers/verification/approve.js
exports.approveVerification = async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        status, 
        comments,
        checks
      } = req.body;
  
      const verification = await Verification.findById(id);
      if (!verification) {
        return res.status(404).json({
          message: 'Verification not found'
        });
      }
  
      // Update verification
      verification.status = status;
      verification.comments = comments;
      verification.checks = checks;
  
      if (req.file) { // Digital signature
        const result = await uploadToCloudinary(req.file.path, 'signatures');
        verification.signature = {
          url: result.url,
          timestamp: new Date()
        };
      }
  
      await verification.save();
  
      // Update property status
      await Property.findByIdAndUpdate(verification.property, {
        verificationStatus: status === 'approved' ? 'verified' : 'unverified',
        $push: {
          history: {
            action: 'verification_completed',
            performedBy: req.user.id,
            details: { status, verificationId: verification._id }
          }
        }
      });
  
      res.json(verification);
    } catch (error) {
      res.status(500).json({
        message: 'Error approving verification'
      });
    }
  };