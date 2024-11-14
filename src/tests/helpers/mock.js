// src/tests/helpers/mock.js
const mockCloudinaryUpload = () => {
    return {
      secure_url: 'https://test-cloudinary.com/test-image.jpg',
      public_id: 'test-public-id',
    };
  };
  
  const mockMailSend = () => {
    return { messageId: 'test-message-id' };
  };
  
  // Mock file upload
  const mockFile = {
    fieldname: 'document',
    originalname: 'test.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    buffer: Buffer.from('test file content'),
    size: 1024,
  };
  
  module.exports = {
    mockCloudinaryUpload,
    mockMailSend,
    mockFile,
  };