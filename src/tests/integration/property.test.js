// src/tests/unit/property.test.js
const PropertyService = require('../../services/property.service');
const { Property } = require('../../models');
const { AppError } = require('../../middleware/error');

// Mock the models
jest.mock('../../models', () => ({
  Property: {
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn()
  }
}));

// Mock cloudinary config
jest.mock('../../config/cloudinary', () => ({
  uploadToCloudinary: jest.fn().mockResolvedValue({
    url: 'mock-url',
    publicId: 'mock-public-id'
  })
}));

describe('PropertyService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('createProperty', () => {
    const mockPropertyData = {
      title: 'Test Property',
      description: 'Test Description',
      type: 'residential',
      size: 100,
      location: {
        address: 'Test Address',
        area: 'Test Area',
        city: 'Test City'
      },
      price: 100000
    };

    const mockFiles = {
      deed: [{ path: 'test/path/deed.pdf' }]
    };

    it('should create a new property', async () => {
      const mockCreatedProperty = {
        _id: 'mockPropertyId',
        ...mockPropertyData,
        owner: 'mockUserId'
      };

      Property.create.mockResolvedValue(mockCreatedProperty);

      const result = await PropertyService.createProperty(
        mockPropertyData,
        mockFiles,
        'mockUserId'
      );

      expect(result._id).toBeDefined();
      expect(Property.create).toHaveBeenCalled();
      expect(result.owner).toBe('mockUserId');
    });
  });

  describe('updateProperty', () => {
    const mockPropertyId = 'mockPropertyId';
    const mockUserId = 'mockUserId';
    const mockUpdateData = {
      title: 'Updated Title'
    };

    it('should update property if owner matches', async () => {
      const mockProperty = {
        _id: mockPropertyId,
        owner: mockUserId,
        title: 'Original Title'
      };

      Property.findById.mockResolvedValue(mockProperty);
      Property.findByIdAndUpdate.mockResolvedValue({
        ...mockProperty,
        ...mockUpdateData
      });

      const result = await PropertyService.updateProperty(
        mockPropertyId,
        mockUpdateData,
        null,
        mockUserId
      );

      expect(result.title).toBe(mockUpdateData.title);
      expect(Property.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('should throw error if property not found', async () => {
      Property.findById.mockResolvedValue(null);

      await expect(PropertyService.updateProperty(
        mockPropertyId,
        mockUpdateData,
        null,
        mockUserId
      )).rejects.toThrow(AppError);

      expect(Property.findById).toHaveBeenCalledWith(mockPropertyId);
    });

    it('should throw error if user is not the owner', async () => {
      const mockProperty = {
        _id: mockPropertyId,
        owner: 'differentUserId',
        title: 'Original Title'
      };

      Property.findById.mockResolvedValue(mockProperty);

      await expect(PropertyService.updateProperty(
        mockPropertyId,
        mockUpdateData,
        null,
        mockUserId
      )).rejects.toThrow(AppError);
    });
  });
});