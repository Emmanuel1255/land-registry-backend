// src/controllers/transfer/index.js
const mongoose = require('mongoose');
const Property = mongoose.model('Property');
const Transfer = mongoose.model('Transfer');
const { uploadToCloudinary } = require('../../config/cloudinary'); 

exports.initiateTransfer = async (req, res) => {
  try {
    const {
      propertyId,
      toOwnerId,
      transferReason,
      agreementDate,
      toOwnerDetails
    } = req.body;

    console.log('Request body:', req.body); // For debugging

    // Validate required fields
    if (!toOwnerDetails || !toOwnerDetails.name || !toOwnerDetails.identification || !toOwnerDetails.contact) {
      return res.status(400).json({
        message: 'Missing required owner details',
        errors: {
          toOwnerDetails: 'Name, identification, and contact are required'
        }
      });
    }

    // Validate property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Create transfer with all required fields
    const transfer = await Transfer.create({
      property: propertyId,
      fromOwner: req.user.id,
      toOwnerId,
      toOwnerDetails,
      transferReason,
      agreementDate,
      status: 'pending'
    });

    // Update property status
    await property.updateOne({ status: 'pending_transfer' });

    res.status(201).json(transfer);
  } catch (error) {
    console.error('Transfer initiation error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {})
      });
    }

    res.status(500).json({
      message: 'Failed to initiate transfer',
      error: error.message
    });
  }
};

exports.uploadDocuments = async (req, res) => {
  try {
    const { transferId } = req.params;
    const files = req.files; // This will now be an object with file arrays

    if (!files || !files.documents) {
      return res.status(400).json({ message: 'No documents uploaded' });
    }

    const transfer = await Transfer.findById(transferId);
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    // Upload documents to Cloudinary
    const documents = [];
    for (const file of files.documents) {
      try {
        const result = await uploadToCloudinary(file.path, 'transfer-documents');
        if (result && result.url) {
          documents.push({
            type: file.mimetype.includes('pdf') ? 'transfer_deed' : 'supporting_document',
            url: result.url,
            publicId: result.public_id,
            name: file.originalname,
            uploadedAt: new Date()
          });
        }
      } catch (uploadError) {
        console.error('Document upload error:', uploadError);
      }
    }

    // Update transfer with new documents
    transfer.documents.push(...documents);
    await transfer.save();

    res.json({
      status: 'success',
      data: transfer,
      uploadedDocuments: documents
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ 
      message: 'Error uploading documents',
      error: error.message 
    });
  }
};

// Add document deletion endpoint
exports.deleteDocument = async (req, res) => {
  try {
    const { transferId, documentId } = req.params;

    const transfer = await Transfer.findById(transferId);
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    // Find the document
    const document = transfer.documents.id(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete from Cloudinary if publicId exists
    if (document.publicId) {
      try {
        await cloudinary.uploader.destroy(document.publicId);
      } catch (deleteError) {
        console.error('Cloudinary deletion error:', deleteError);
      }
    }

    // Remove document from transfer
    transfer.documents.pull(documentId);
    await transfer.save();

    res.json({
      status: 'success',
      message: 'Document deleted successfully',
      data: transfer
    });
  } catch (error) {
    console.error('Document deletion error:', error);
    res.status(500).json({ 
      message: 'Error deleting document',
      error: error.message 
    });
  }
};

exports.updateTransfer = async (req, res) => {
  try {
    const { transferId } = req.params;
    const { transferAmount, paymentDetails } = req.body;
    const { files } = req;

    const transfer = await Transfer.findById(transferId);
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    // Handle new document uploads if any
    if (files && files.length > 0) {
      const documents = [];
      for (const file of files) {
        try {
          const result = await uploadToCloudinary(file.path, 'transfer-documents');
          if (result && result.url) {
            documents.push({
              type: file.mimetype.includes('pdf') ? 'payment_proof' : 'supporting_document',
              url: result.url,
              publicId: result.public_id,
              name: file.originalname,
              uploadedAt: new Date()
            });
          }
        } catch (uploadError) {
          console.error('Document upload error:', uploadError);
        }
      }
      transfer.documents.push(...documents);
    }

    // Update transfer details
    if (transferAmount) transfer.transferAmount = transferAmount;
    if (paymentDetails) transfer.paymentDetails = paymentDetails;
    transfer.status = 'processing';
    
    await transfer.save();

    res.json({
      status: 'success',
      data: transfer
    });
  } catch (error) {
    console.error('Transfer update error:', error);
    res.status(500).json({ 
      message: 'Error updating transfer',
      error: error.message 
    });
  }
};

exports.completeTransfer = async (req, res) => {
  try {
    const { transferId } = req.params;
    const { signature } = req.body;
    const { files } = req;

    const transfer = await Transfer.findById(transferId);
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    // Handle signature upload if it's a file
    let signatureUrl = signature;
    if (files && files.signature) {
      try {
        const result = await uploadToCloudinary(files.signature[0].path, 'transfer-signatures');
        signatureUrl = result.url;
      } catch (uploadError) {
        console.error('Signature upload error:', uploadError);
      }
    }

    // Update transfer status
    transfer.status = 'completed';
    transfer.transferDate = new Date();
    transfer.approvals = {
      seller: {
        approved: true,
        signature: signatureUrl,
        timestamp: new Date()
      }
    };

    await transfer.save();

    // Update property ownership
    await Property.findByIdAndUpdate(transfer.property, {
      owner: transfer.toOwnerDetails.identification,
      status: 'registered',
      $push: {
        history: {
          action: 'transferred',
          performedBy: req.user.id,
          details: { transferId: transfer._id }
        }
      }
    });

    res.json({
      status: 'success',
      data: transfer
    });
  } catch (error) {
    console.error('Transfer completion error:', error);
    res.status(500).json({ 
      message: 'Error completing transfer',
      error: error.message 
    });
  }
};



exports.listTransfers = async (req, res) => {
  try {
    const transfers = await Transfer.find({
      $or: [
        { fromOwner: req.user.id },
        { 'toOwnerDetails.identification': req.user.id }
      ]
    }).populate('property');

    res.json({
      status: 'success',
      results: transfers.length,
      data: transfers
    });
  } catch (error) {
    console.error('List transfers error:', error);
    res.status(500).json({ 
      message: 'Error listing transfers',
      error: error.message 
    });
  }
};

exports.getTransfer = async (req, res) => {
  try {
    const { transferId } = req.params;
    const transfer = await Transfer.findById(transferId)
      .populate('property')
      .populate('fromOwner', 'firstName lastName email');

    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    res.json({
      status: 'success',
      data: transfer
    });
  } catch (error) {
    console.error('Get transfer error:', error);
    res.status(500).json({ 
      message: 'Error fetching transfer',
      error: error.message 
    });
  }
};