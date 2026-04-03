import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock prisma before importing the service
const mockPrismaUser = {
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};
const mockPrismaRefreshToken = {
  create: jest.fn(),
  findUnique: jest.fn(),
  delete: jest.fn(),
  deleteMany: jest.fn(),
};

jest.mock('../../../src/config/database', () => ({
  prisma: {
    user: mockPrismaUser,
    refreshToken: mockPrismaRefreshToken,
  },
}));

jest.mock('../../../src/config/index', () => ({
  config: {
    jwt: {
      secret: 'test-secret',
      expiresIn: '24h',
      refreshSecret: 'test-refresh-secret',
      refreshExpiresIn: '7d',
    },
    bcrypt: { rounds: 4 },
    isDevelopment: true,
    isProduction: false,
  },
}));

jest.mock('../../../src/config/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

import * as authService from '../../../src/services/auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerInput = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      firstName: 'Test',
      lastName: 'User',
    };

    it('should register a new user successfully', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);
      mockPrismaUser.create.mockResolvedValue({
        id: 'user-1',
        email: registerInput.email,
        firstName: registerInput.firstName,
        lastName: registerInput.lastName,
        username: null,
        role: 'USER',
        createdAt: new Date(),
      });
      mockPrismaRefreshToken.create.mockResolvedValue({});

      const result = await authService.register(registerInput);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(registerInput.email);
      expect(mockPrismaUser.create).toHaveBeenCalledTimes(1);
    });

    it('should reject duplicate email', async () => {
      mockPrismaUser.findUnique.mockResolvedValue({ id: 'existing-user' });

      await expect(authService.register(registerInput)).rejects.toEqual(
        expect.objectContaining({ statusCode: 409 })
      );
    });
  });

  describe('login', () => {
    const loginInput = {
      email: 'test@example.com',
      password: 'SecurePass123!',
    };

    it('should login successfully with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash(loginInput.password, 4);
      mockPrismaUser.findUnique.mockResolvedValue({
        id: 'user-1',
        email: loginInput.email,
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        username: null,
        role: 'USER',
        status: 'ACTIVE',
      });
      mockPrismaUser.update.mockResolvedValue({});
      mockPrismaRefreshToken.create.mockResolvedValue({});

      const result = await authService.login(loginInput);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should reject invalid email', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);

      await expect(authService.login(loginInput)).rejects.toEqual(
        expect.objectContaining({ statusCode: 401 })
      );
    });

    it('should reject invalid password', async () => {
      mockPrismaUser.findUnique.mockResolvedValue({
        id: 'user-1',
        email: loginInput.email,
        password: await bcrypt.hash('DifferentPassword', 4),
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
        status: 'ACTIVE',
      });

      await expect(authService.login(loginInput)).rejects.toEqual(
        expect.objectContaining({ statusCode: 401 })
      );
    });

    it('should reject inactive user', async () => {
      const hashedPassword = await bcrypt.hash(loginInput.password, 4);
      mockPrismaUser.findUnique.mockResolvedValue({
        id: 'user-1',
        email: loginInput.email,
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
        status: 'SUSPENDED',
      });

      await expect(authService.login(loginInput)).rejects.toEqual(
        expect.objectContaining({ statusCode: 403 })
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      mockPrismaUser.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
      });

      const result = await authService.getProfile('user-1');
      expect(result).toHaveProperty('email', 'test@example.com');
    });

    it('should throw 404 for non-existent user', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);

      await expect(authService.getProfile('non-existent')).rejects.toEqual(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  describe('logout', () => {
    it('should revoke specific refresh token', async () => {
      mockPrismaRefreshToken.deleteMany.mockResolvedValue({ count: 1 });

      await authService.logout('user-1', 'some-refresh-token');

      expect(mockPrismaRefreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', token: 'some-refresh-token' },
      });
    });

    it('should revoke all tokens when no specific token given', async () => {
      mockPrismaRefreshToken.deleteMany.mockResolvedValue({ count: 3 });

      await authService.logout('user-1');

      expect(mockPrismaRefreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });
  });

  describe('refreshAccessToken', () => {
    it('should reject invalid refresh token', async () => {
      mockPrismaRefreshToken.findUnique.mockResolvedValue(null);

      await expect(authService.refreshAccessToken('invalid-token')).rejects.toEqual(
        expect.objectContaining({ statusCode: 401 })
      );
    });

    it('should reject expired refresh token', async () => {
      mockPrismaRefreshToken.findUnique.mockResolvedValue({
        id: 'rt-1',
        token: 'expired-token',
        expiresAt: new Date(Date.now() - 1000),
        user: { id: 'user-1', email: 'test@example.com', role: 'USER', status: 'ACTIVE' },
      });
      mockPrismaRefreshToken.delete.mockResolvedValue({});

      await expect(authService.refreshAccessToken('expired-token')).rejects.toEqual(
        expect.objectContaining({ statusCode: 401 })
      );
    });
  });
});
