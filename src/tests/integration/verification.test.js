// src/tests/integration/verification.test.js
describe('Verification Process', () => {
    let verifierToken;
    let property;
  
    beforeEach(async () => {
      const { token } = await createTestVerifier();
      verifierToken = token;
      property = await createTestProperty(userId);
    });
  
    it('should submit verification request', async () => {
      const res = await request(app)
        .post('/api/verification/submit')
        .set('Authorization', `Bearer ${token}`)
        .field({
          propertyId: property._id,
          lsNumber: 'LS1234/2024',
          pageNumber: '123',
          volumeNumber: '45',
        })
        .attach('documents', mockFile);
  
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('pending');
    });
  
    it('should approve verification request', async () => {
      // First submit verification
      const submitRes = await request(app)
        .post('/api/verification/submit')
        .set('Authorization', `Bearer ${token}`)
        .field({
          propertyId: property._id,
          lsNumber: 'LS1234/2024',
          pageNumber: '123',
          volumeNumber: '45',
        });
  
      const verificationId = submitRes.body._id;
  
      // Then approve it
      const res = await request(app)
        .put(`/api/verification/${verificationId}/approve`)
        .set('Authorization', `Bearer ${verifierToken}`)
        .send({
          status: 'approved',
          comments: 'All documents verified',
        });
  
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('approved');
  
      // Check property status was updated
      const updatedProperty = await Property.findById(property._id);
      expect(updatedProperty.verificationStatus).toBe('verified');
    });
  });