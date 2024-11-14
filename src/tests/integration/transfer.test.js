// src/tests/integration/transfer.test.js
const request = require('supertest');
const app = require('../../app');
const { User, Property, Transfer } = require('../../models');
const { connectDB, closeDB, clearDB } = require('../helpers/db');

describe('Transfer Endpoints', () => {
  let sellerToken;
  let buyerToken;
  let property;

  beforeAll(async () => {
    await connectDB();
    
    // Create seller and buyer
    const seller = await User.create({
      firstName: 'Seller',
      lastName: 'User',
      email: 'seller@example.com',
      password: 'password123'
    });
    
    const buyer = await User.create({
      firstName: 'Buyer',
      lastName: 'User',
      email: 'buyer@example.com',
      password: 'password123'
    });

    sellerToken = seller.generateAuthToken();
    buyerToken = buyer.generateAuthToken();

    // Create verified property
    property = await Property.create({
      title: 'Test Property',
      description: 'Test Description',
      type: 'residential',
      size: 100,
      location: {
        address: 'Test Address',
        area: 'Test Area',
        city: 'Test City'
      },
      price: 100000,
      owner: seller._id,
      verificationStatus: 'verified'
    });
  });

  afterEach(async () => await clearDB());
  afterAll(async () => await closeDB());

  describe('POST /api/transfer/initiate', () => {
    it('should initiate a transfer', async () => {
      const res = await request(app)
        .post('/api/transfer/initiate')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          propertyId: property._id,
          toOwnerId: buyer._id,
          transferAmount: 100000
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.status).toBe('pending');
    });
  });

  describe('PUT /api/transfer/:id/approve', () => {
    let transfer;

    beforeEach(async () => {
      transfer = await Transfer.create({
        property: property._id,
        fromOwner: seller._id,
        toOwner: buyer._id,
        transferAmount: 100000,
        status: 'pending'
      });
    });

    it('should approve transfer as buyer', async () => {
      const res = await request(app)
        .put(`/api/transfer/${transfer._id}/approve`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          role: 'buyer'
        });

      expect(res.status).toBe(200);
      expect(res.body.approvals.buyer.approved).toBe(true);
    });
  });
});