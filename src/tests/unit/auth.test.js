const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const AuthService = require('../../services/auth.service');
const { AppError } = require('../../middleware/error');

jest.mock('../../models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const mockUserData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123'
    };

    it('should successfully register a new user', async () => {
      const mockUser = {
        _id: 'mockId',
        ...mockUserData,
        toObject: () => ({ ...mockUserData, _id: 'mockId' })
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mockedToken');

      const result = await AuthService.register(mockUserData);

      expect(result.user).toBeDefined();
      expect(result.token).toBe('mockedToken');
      expect(User.create).toHaveBeenCalledWith(mockUserData);
    });

    it('should throw error if user already exists', async () => {
      User.findOne.mockResolvedValue({ email: mockUserData.email });

      await expect(AuthService.register(mockUserData))
        .rejects
        .toThrow('User already exists');
    });
  });

  describe('login', () => {
    const mockCredentials = {
      email: 'john@example.com',
      password: 'password123'
    };

    const mockUser = {
      _id: 'mockId',
      email: mockCredentials.email,
      password: 'hashedPassword',
      toObject: () => ({ _id: 'mockId', email: mockCredentials.email })
    };

    it('should successfully login user', async () => {
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mockedToken');

      const result = await AuthService.login(mockCredentials);

      expect(result.user).toBeDefined();
      expect(result.token).toBe('mockedToken');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockCredentials.password,
        mockUser.password
      );
    });

    it('should throw error if user not found', async () => {
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await expect(AuthService.login(mockCredentials))
        .rejects
        .toThrow('Invalid credentials');
    });

    it('should throw error if password is invalid', async () => {
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });
      bcrypt.compare.mockResolvedValue(false);

      await expect(AuthService.login(mockCredentials))
        .rejects
        .toThrow('Invalid credentials');
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockUser = {
        _id: 'mockId',
        firstName: 'John',
        email: 'john@example.com'
      };

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      const result = await AuthService.getProfile('mockId');
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user not found', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await expect(AuthService.getProfile('mockId'))
        .rejects
        .toThrow('User not found');
    });
  });

  describe('updateProfile', () => {
    const mockUpdateData = {
      firstName: 'Updated',
      lastName: 'Name'
    };

    it('should update user profile', async () => {
      const mockUpdatedUser = {
        _id: 'mockId',
        ...mockUpdateData
      };

      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUpdatedUser)
      });

      const result = await AuthService.updateProfile('mockId', mockUpdateData);
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should not update password through profile update', async () => {
      const dataWithPassword = {
        ...mockUpdateData,
        password: 'newpassword'
      };

      await AuthService.updateProfile('mockId', dataWithPassword);

      expect(User.findByIdAndUpdate).not.toHaveBeenCalledWith(
        'mockId',
        expect.objectContaining({ password: 'newpassword' }),
        expect.any(Object)
      );
    });
  });

  describe('verifyToken', () => {
    it('should verify and return user for valid token', async () => {
      const mockUser = {
        _id: 'mockId',
        email: 'john@example.com'
      };

      jwt.verify.mockReturnValue({ id: 'mockId' });
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      const result = await AuthService.verifyToken('validToken');
      expect(result).toEqual(mockUser);
    });

    it('should throw error for invalid token', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(AuthService.verifyToken('invalidToken'))
        .rejects
        .toThrow('Invalid token');
    });
  });
});