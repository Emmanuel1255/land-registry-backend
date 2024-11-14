// src/services/document.service.js
const { cloudinary } = require('../config/cloudinary');
const { AppError } = require('../middleware/error');

class DocumentService {
  async uploadDocument(file, folder = 'general') {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: `land-registry/${folder}`,
        resource_type: 'auto'
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format
      };
    } catch (error) {
      throw new AppError('Error uploading document', 500);
    }
  }

  async deleteDocument(publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
      return true;
    } catch (error) {
      throw new AppError('Error deleting document', 500);
    }
  }

  async validateDocument(document) {
    // Implement document validation logic
    // This could include checking file type, size, and contents
    return true;
  }
}

module.exports = new DocumentService();