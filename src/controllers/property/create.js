// src/controllers/property/create.js
const { Property } = require('../../models');
const { uploadToCloudinary } = require('../../config/cloudinary');

exports.createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      size,
      location,
      price,
      lsNumber,
      pageNumber,
      volumeNumber
    } = req.body;

    // Handle document uploads
    const documents = [];
    if (req.files) {
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
    }

    const property = await Property.create({
      title,
      description,
      type,
      size,
      location: JSON.parse(location),
      price,
      owner: req.user.id,
      documents,
      lsNumber,
      pageNumber,
      volumeNumber,
      history: [{
        action: 'created',
        performedBy: req.user.id,
        details: { method: 'registration' }
      }]
    });

    res.status(201).json(property);
  } catch (error) {
    console.error('Property creation error:', error);
    res.status(500).json({
      message: 'Error creating property'
    });
  }
};