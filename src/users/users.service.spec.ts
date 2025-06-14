import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotFoundException } from '@nestjs/common';
import CreateUserDto from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

const mockDB = [
  {
    id: 'first',
    username: 'alex',
    email: 'alex@example.com',
    role: Role.USER,
    password: 'pass',
  },
  {
    id: 'second',
    username: 'john',
    email: 'john@example.com',
    role: Role.MODERATOR,
    password: 'pass',
  },
  {
    id: 'third',
    username: 'alice',
    email: 'alice@example.com',
    role: Role.ADMIN,
    password: 'pass',
  },
];

const testUser = mockDB[0];

const db = {
  user: {
    findMany: jest.fn().mockReturnValue(mockDB),
    findUnique: jest.fn(({ where }) => {
      return mockDB.find(
        (user) =>
          user.username === where.username ||
          user.email === where.email ||
          user.id === where.id,
      );
    }),
    create: jest.fn(({ data }) => {
      return data;
    }),
    update: jest
      .fn()
      .mockImplementation(({ data }) => ({ ...testUser, ...data })),
    delete: jest.fn().mockReturnValue(undefined),
    count: jest.fn().mockReturnValue(mockDB.length),
  },
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: db,
        },
      ],
      imports: [PrismaModule],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return paginated list of users', async () => {
    const result = await service.getAllUsers({ page: 1, limit: 10 });
    expect(result.data).toHaveLength(mockDB.length);
    expect(result.total).toBe(mockDB.length);
  });

  it('should return true if user with such username is exist', async () => {
    const result = await service.checkUserExistsByUsername('alex');
    expect(result).toBe(true);
  });

  it('should return true if user with such email is exist', async () => {
    const result = await service.checkUserExistsByEmail('alex@example.com');
    expect(result).toBe(true);
  });

  it('should return user by username', async () => {
    const result = await service.getUserByUsername('alex');
    expect(result.username).toBe('alex');
  });

  it('should throw NotFoundException for non-existing username', async () => {
    await expect(service.getUserByUsername('nonexistent')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should create a new user with hashed password', async () => {
    const createUserDto: CreateUserDto = {
      username: 'newuser',
      email: 'newuser@example.com',
      password: '12345678',
    };

    const result = await service.createUser(createUserDto);
    expect(result.password).not.toEqual('12345678');
    expect(await bcrypt.compare('12345678', result.password)).toBe(true);
  });

  it('should update user password if provided', async () => {
    const result = await service.updateUser('alex', { password: 'newpass' });
    expect(result).toBeDefined();
    expect(result.password).not.toBe('pass');
    expect(await bcrypt.compare('newpass', result.password)).toBe(true);
  });

  it('should delete user', async () => {
    const result = await service.deleteUser('alex');
    expect(result).toEqual({ message: 'User deleted successfully' });
  });
});
