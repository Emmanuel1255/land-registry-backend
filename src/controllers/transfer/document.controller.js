// src/controllers/transfer/document.controller.js
const transferDocumentService = require('../../services/transferDocument.service');

exports.uploadDocuments = async (req, res) => {
  try {
    const { transferId } = req.params;
    const { files } = req;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const transfer = await transferDocumentService.uploadDocuments(transferId, files);
    res.json(transfer);
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(error.statusCode || 500).json({ 
      message: error.message || 'Error uploading documents' 
    });
  }
};

exports.removeDocument = async (req, res) => {
  try {
    const { transferId, documentId } = req.params;
    const transfer = await transferDocumentService.removeDocument(transferId, documentId);
    res.json(transfer);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};