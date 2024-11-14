// src/controllers/property/documents.js
exports.uploadDocuments = async (req, res) => {
    try {
      const { id } = req.params;
      const property = await Property.findById(id);
  
      if (!property) {
        return res.status(404).json({
          message: 'Property not found'
        });
      }
  
      // Upload new documents
      const newDocuments = [];
      for (const [key, files] of Object.entries(req.files)) {
        for (const file of files) {
          const result = await uploadToCloudinary(file.path, 'properties');
          newDocuments.push({
            name: file.originalname,
            type: key,
            url: result.url,
            publicId: result.publicId,
          });
        }
      }
  
      // Add new documents to property
      property.documents.push(...newDocuments);
      property.history.push({
        action: 'updated',
        performedBy: req.user.id,
        details: { documentsAdded: newDocuments.length }
      });
  
      await property.save();
  
      res.json(property);
    } catch (error) {
      res.status(500).json({
        message: 'Error uploading documents'
      });
    }
  };