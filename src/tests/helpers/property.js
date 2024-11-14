// src/tests/helpers/property.js
const { Property } = require('../../models');

const createTestProperty = async (userId, propertyData = {}) => {
  const defaultProperty = {
    title: 'Test Property',
    description: 'Test Description',
    type: 'residential',
    size: 100,
    location: {
      address: 'Test Address',
      area: 'Test Area',
      city: 'Test City',
      coordinates: {
        lat: 0,
        lng: 0,
      },
    },
    price: 100000,
    owner: userId,
    status: 'pending',
    verificationStatus: 'unverified',
  };

  return Property.create({ ...defaultProperty, ...propertyData });
};

const createVerifiedProperty = async (userId) => {
  return createTestProperty(userId, {
    status: 'registered',
    verificationStatus: 'verified',
  });
};

module.exports = {
  createTestProperty,
  createVerifiedProperty,
};