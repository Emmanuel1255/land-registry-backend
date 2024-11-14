// src/controllers/property/update.js
exports.updateProperty = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
  
      // Handle new document uploads
      if (req.files) {
        const documents = [];
        for (const [key, files] of Object.entries(req.files)) {
          for (const file of files) {
            const result = await uploadToCloudinary(file.path, 'properties');
            documents.push({
              name: file.originalname,
              type: key,
              url: result.url,
              publicId: result.publicId,
            });
          }
        }
        updateData.documents = documents;
      }
  
      const property = await Property.findByIdAndUpdate(
        id,
        { 
          $set: updateData,
          $push: {
            history: {
              action: 'updated',
              performedBy: req.user.id,
              details: { updatedFields: Object.keys(updateData) }
            }
          }
        },
        { new: true }
      );
  
      if (!property) {
        return res.status(404).json({
          message: 'Property not found'
        });
      }
  
      res.json(property);
    } catch (error) {
      res.status(500).json({
        message: 'Error updating property'
      });
    }
  };