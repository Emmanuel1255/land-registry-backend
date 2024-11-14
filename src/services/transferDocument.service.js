// src/services/transferDocument.service.js
const { Transfer } = require('../models');
const { uploadToCloudinary } = require('../config/cloudinary');
const { AppError } = require('../middleware/error');

class TransferDocumentService {
  async uploadDocuments(transferId, files) {
    try {
      const transfer = await Transfer.findById(transferId);
      if (!transfer) {
        throw new AppError('Transfer not found', 404);
      }

      const documents = [];
      for (const file of files) {
        try {
          // Upload to Cloudinary
          const result = await uploadToCloudinary(file.path, 'transfer-documents');
          if (result && result.url) {
            documents.push({
              url: result.url,
              publicId: result.public_id,
              name: file.originalname,
              type: file.mimetype,
              uploadedAt: new Date()
            });
          }
        } catch (uploadError) {
          console.error('Document upload error:', uploadError);
          throw new AppError('Error uploading document', 500);
        }
      }

      // Update transfer with new documents
      transfer.documents.push(...documents);
      await transfer.save();

      return transfer;
    } catch (error) {
      throw new AppError(error.message || 'Error uploading documents', error.statusCode || 500);
    }
  }

  async removeDocument(transferId, documentId) {
    try {
      const transfer = await Transfer.findById(transferId);
      if (!transfer) {
        throw new AppError('Transfer not found', 404);
      }

      const document = transfer.documents.id(documentId);
      if (!document) {
        throw new AppError('Document not found', 404);
      }

      // Remove from Cloudinary
      await cloudinary.uploader.destroy(document.publicId);

      // Remove from transfer
      transfer.documents.pull(documentId);
      await transfer.save();

      return transfer;
    } catch (error) {
      throw new AppError(error.message || 'Error removing document', error.statusCode || 500);
    }
  }
}

module.exports = new TransferDocumentService();