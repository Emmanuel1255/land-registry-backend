// src/services/property.service.js
const { Property } = require('../models');
const { AppError } = require('../middleware/error');
const { uploadToCloudinary } = require('../config/cloudinary');

class PropertyService {
  async createProperty(propertyData, files, userId) {
    try {
      
      // Generate a unique LS number if not provided
      if (!propertyData.lsNumber) {
        const year = new Date().getFullYear();
        const count = await Property.countDocuments() + 1;
        propertyData.lsNumber = `LS${count.toString().padStart(4, '0')}/${year}`;
      }
      
      // Handle property images
      const images = [];
      if (files && files.images) {
        for (const file of files.images) {
          const result = await uploadToCloudinary(file.path, 'property-images');
          images.push({
            url: result.url,
            publicId: result.public_id,
            isMain: images.length === 0 // First image is main
          });
        }
      }

      // Handle document uploads (existing code)
      const documents = [];
      if (files) {
        for (const [type, fileArray] of Object.entries(files)) {
          if (type !== 'images' && Array.isArray(fileArray)) {
            for (const file of fileArray) {
              try {
                const result = await uploadToCloudinary(file.path, 'properties');
                if (result && result.url) {
                  documents.push({
                    type,
                    url: result.url,
                    publicId: result.public_id,
                    name: file.originalname
                  });
                }
              } catch (uploadError) {
                console.error('File upload error:', uploadError);
              }
            }
          }
        }
      }

      // Create property with images
      const property = await Property.create({
        ...propertyData,
        owner: userId,
        documents,
        images,
        history: [{
          action: 'created',
          performedBy: userId
        }]
      });

      return property;
    } catch (error) {
      console.error('Property creation error:', error);
      throw new AppError(error.message || 'Error creating property', 400);
    }
  }

  async updatePropertyImage(id, imageFile, userId) {
    const property = await Property.findById(id);
    if (!property) {
      throw new AppError('Property not found', 404);
    }

    if (property.owner.toString() !== userId) {
      throw new AppError('Not authorized to update this property', 403);
    }

    const result = await uploadToCloudinary(imageFile.path, 'property-images');
    const newImage = {
      url: result.url,
      publicId: result.public_id,
      isMain: !property.images.length, // Make it main if it's the first image
      uploadedAt: new Date()
    };

    property.images.push(newImage);
    await property.save();

    return property;
  }

  async deletePropertyImage(propertyId, imageId, userId) {
    const property = await Property.findById(propertyId);
    if (!property) {
      throw new AppError('Property not found', 404);
    }

    if (property.owner.toString() !== userId) {
      throw new AppError('Not authorized to modify this property', 403);
    }

    const image = property.images.id(imageId);
    if (!image) {
      throw new AppError('Image not found', 404);
    }

    await cloudinary.uploader.destroy(image.publicId);
    property.images.pull(imageId);
    await property.save();

    return property;
  }

  async updateProperty(id, updateData, files, userId) {
    const property = await Property.findById(id);

    if (!property) {
      throw new AppError('Property not found', 404);
    }

    if (property.owner.toString() !== userId) {
      throw new AppError('Not authorized to update this property', 403);
    }

    // Process new documents if any
    if (files) {
      const documents = [];
      for (const [type, fileArray] of Object.entries(files)) {
        for (const file of fileArray) {
          const result = await uploadToCloudinary(file.path, 'properties');
          documents.push({
            type,
            url: result.url,
            publicId: result.publicId
          });
        }
      }
      updateData.documents = [...(property.documents || []), ...documents];
    }

    // Update property
    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      {
        $set: updateData,
        $push: {
          history: {
            action: 'updated',
            performedBy: userId,
            details: { updatedFields: Object.keys(updateData) }
          }
        }
      },
      { new: true }
    );

    return updatedProperty;
  }
  async listProperties(userId, query = {}) {
    try {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const searchQuery = { owner: userId };

      // Add status filter if provided
      if (query.status) {
        searchQuery.status = query.status;
      }

      const properties = await Property.find(searchQuery)
        .populate('owner', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit);

      const total = await Property.countDocuments(searchQuery);

      return {
        properties,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      };
    } catch (error) {
      throw new AppError('Error fetching properties', 500);
    }
  }

  async getProperty(propertyId) {
    try {
      const property = await Property.findById(propertyId)
        .populate('owner', 'firstName lastName email');
      
      if (!property) {
        throw new AppError('Property not found', 404);
      }

      return property;
    } catch (error) {
      throw new AppError(error.message, error.statusCode || 500);
    }
  }

  async searchProperties(searchParams) {
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
      } = searchParams;

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
        if (minPrice) searchQuery.price.$gte = Number(minPrice);
        if (maxPrice) searchQuery.price.$lte = Number(maxPrice);
      }

      const properties = await Property.find(searchQuery)
        .populate('owner', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      const total = await Property.countDocuments(searchQuery);

      return {
        properties,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total
      };
    } catch (error) {
      throw new AppError('Error searching properties', 500);
    }
  }
}

module.exports = new PropertyService();