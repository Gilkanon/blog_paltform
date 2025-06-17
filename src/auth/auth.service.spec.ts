import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';

jest.mock('bcrypt');

const mockUser = {
  id: 'user-id',
  username: 'testuser',
  email: 'test@example.com',
  password: 'hashed-password',
  role: Role.USER,
};

const mockUsersService = {
  checkUserExistsByUsername: jest.fn(),
  checkUserExistsByEmail: jest.fn(),
  createUser: jest.fn(),
  getUserByUsername: jest.fn(),
  getUserById: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('access-token'),
};

const mockPrismaService = {
  refreshToken: {
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
      imports: [PrismaModule, UsersModule],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should throw if passwords do not match', async () => {
      await expect(
        service.signUp({
          username: 'testuser',
          email: 'test@example.com',
          password: 'pass1',
          confirmPassword: 'pass2',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if username exists', async () => {
      mockUsersService.checkUserExistsByUsername.mockResolvedValue(true);
      await expect(
        service.signUp({
          username: 'testuser',
          email: 'test@example.com',
          password: 'pass',
          confirmPassword: 'pass',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw if email exists', async () => {
      mockUsersService.checkUserExistsByUsername.mockResolvedValue(false);
      mockUsersService.checkUserExistsByEmail.mockResolvedValue(true);
      await expect(
        service.signUp({
          username: 'testuser',
          email: 'test@example.com',
          password: 'pass',
          confirmPassword: 'pass',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user and sign in', async () => {
      mockUsersService.checkUserExistsByUsername.mockResolvedValue(false);
      mockUsersService.checkUserExistsByEmail.mockResolvedValue(false);
      mockUsersService.createUser.mockResolvedValue(mockUser);
      mockUsersService.getUserByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.signUp({
        username: 'testuser',
        email: 'test@example.com',
        password: 'pass',
        confirmPassword: 'pass',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('signIn', () => {
    it('should throw if user not found', async () => {
      mockUsersService.getUserByUsername.mockResolvedValue(null);
      await expect(
        service.signIn({ username: 'testuser', password: 'pass' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if password is invalid', async () => {
      mockUsersService.getUserByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(
        service.signIn({ username: 'testuser', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens if credentials are valid', async () => {
      mockUsersService.getUserByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await service.signIn({
        username: 'testuser',
        password: 'pass',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('refreshToken', () => {
    it('should throw if token not found or expired', async () => {
      mockPrismaService.refreshToken.findFirst.mockResolvedValue(null);
      await expect(service.refreshToken('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw if user not found', async () => {
      mockPrismaService.refreshToken.findFirst.mockResolvedValue({
        token: 'some-token',
        userId: 'user-id',
        expiresAt: new Date(Date.now() + 10000),
        id: 1,
      });
      mockUsersService.getUserById.mockResolvedValue(null);

      await expect(service.refreshToken('some-token')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return new tokens', async () => {
      mockPrismaService.refreshToken.findFirst.mockResolvedValue({
        token: 'some-token',
        userId: 'user-id',
        expiresAt: new Date(Date.now() + 10000),
        id: 1,
      });
      mockUsersService.getUserById.mockResolvedValue(mockUser);
      mockPrismaService.refreshToken.update.mockResolvedValue({});

      const result = await service.refreshToken('some-token');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('logout', () => {
    it('should throw if token was not deleted', async () => {
      mockPrismaService.refreshToken.deleteMany.mockResolvedValue({ count: 0 });

      await expect(service.logout('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should succeed if token was deleted', async () => {
      mockPrismaService.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

      await expect(service.logout('good-token')).resolves.toBeUndefined();
    });
  });
});
