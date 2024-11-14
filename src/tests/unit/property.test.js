// src/tests/unit/property.test.js
const PropertyService = require('../../services/property.service');
const Property = require('../../models/Property');
const { AppError } = require('../../middleware/error');
const cloudinary = require('../../config/cloudinary');

jest.mock('../../models/Property');
jest.mock('../../config/cloudinary');

describe('PropertyService', () => {
  beforeEach(() => {
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

    it('should create property with images and documents', async () => {
      const mockFiles = {
        images: [{ path: 'test/image.jpg' }],
        deed: [{ path: 'test/deed.pdf', originalname: 'deed.pdf' }]
      };

      Property.countDocuments.mockResolvedValue(0);
      cloudinary.uploadToCloudinary.mockResolvedValue({
        url: 'mock-url',
        public_id: 'mock-id'
      });

      const mockCreatedProperty = {
        _id: 'mockId',
        ...mockPropertyData,
        images: [{
          url: 'mock-url',
          publicId: 'mock-id',
          isMain: true
        }],
        documents: [{
          type: 'deed',
          url: 'mock-url',
          publicId: 'mock-id',
          name: 'deed.pdf'
        }]
      };

      Property.create.mockResolvedValue(mockCreatedProperty);

      const result = await PropertyService.createProperty(mockPropertyData, mockFiles, 'userId');
      
      expect(result.images).toBeDefined();
      expect(result.documents).toBeDefined();
      expect(Property.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockPropertyData,
          owner: 'userId',
          lsNumber: expect.any(String)
        })
      );
    });

    it('should handle missing files', async () => {
      Property.create.mockResolvedValue({ ...mockPropertyData, _id: 'mockId' });
      
      const result = await PropertyService.createProperty(mockPropertyData, null, 'userId');
      
      expect(result._id).toBeDefined();
      expect(cloudinary.uploadToCloudinary).not.toHaveBeenCalled();
    });
  });

  describe('listProperties', () => {
    it('should list properties with pagination', async () => {
      const mockProperties = [
        { _id: '1', title: 'Property 1' },
        { _id: '2', title: 'Property 2' }
      ];

      Property.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              skip: jest.fn().mockResolvedValue(mockProperties)
            })
          })
        })
      });

      Property.countDocuments.mockResolvedValue(2);

      const result = await PropertyService.listProperties('userId', { page: 1, limit: 10 });
      
      expect(result.properties).toHaveLength(2);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('searchProperties', () => {
    it('should search properties with filters', async () => {
      const searchParams = {
        query: 'test',
        type: 'residential',
        minPrice: 1000,
        maxPrice: 5000
      };

      Property.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              skip: jest.fn().mockResolvedValue([])
            })
          })
        })
      });

      const result = await PropertyService.searchProperties(searchParams);
      
      expect(Property.find).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'residential',
          price: { $gte: 1000, $lte: 5000 }
        })
      );
    });
  });
});