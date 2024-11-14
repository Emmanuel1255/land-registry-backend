// src/tests/unit/transfer.test.js
const TransferService = require('../../services/transfer.service');
const Transfer = require('../../models/Transfer');
const Property = require('../../models/Property');
const { AppError } = require('../../middleware/error');

jest.mock('../../models/Transfer');
jest.mock('../../models/Property');

describe('TransferService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initiateTransfer', () => {
    const mockTransferData = {
      propertyId: 'propertyId',
      fromOwnerId: 'sellerId',
      toOwnerId: 'buyerId',
      toOwnerDetails: {
        name: 'Buyer Name',
        identification: 'ID123',
        contact: '1234567890'
      },
      transferAmount: 100000,
      transferReason: 'Sale',
      agreementDate: new Date()
    };

    it('should create transfer record', async () => {
      Property.findById.mockResolvedValue({
        _id: 'propertyId',
        owner: 'sellerId'
      });

      const mockTransfer = {
        _id: 'transferId',
        ...mockTransferData,
        status: 'pending'
      };

      Transfer.create.mockResolvedValue(mockTransfer);

      const result = await TransferService.initiateTransfer(mockTransferData);
      
      expect(result._id).toBeDefined();
      expect(result.status).toBe('pending');
    });
  });

  describe('completeTransfer', () => {
    it('should complete transfer and update property ownership', async () => {
      const mockTransfer = {
        _id: 'transferId',
        property: 'propertyId',
        toOwnerId: 'buyerId',
        status: 'processing',
        save: jest.fn()
      };

      Transfer.findById.mockResolvedValue(mockTransfer);

      const result = await TransferService.completeTransfer('transferId', {}, null, 'userId');
      
      expect(mockTransfer.save).toHaveBeenCalled();
      expect(result.status).toBe('completed');
    });
  });
});