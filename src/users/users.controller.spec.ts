import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Role } from '@prisma/client';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import UserDto from './dto/user.dto';
import UpdateUserDto from './dto/update-user.dto';
import { NotFoundException } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';

const mockUser = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  role: Role.USER,
};

const mockUsersService = {
  getAllUsers: jest.fn().mockReturnValue({ data: [mockUser], total: 1 }),
  getUserByUsername: jest.fn().mockReturnValue(mockUser),
  getUserByEmail: jest.fn().mockReturnValue(mockUser),
  updateUser: jest.fn().mockReturnValue({ ...mockUser, username: 'updated' }),
  deleteUser: jest.fn().mockReturnValue(undefined),
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
      imports: [PrismaModule],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return paginated list of users', async () => {
    const result = await controller.getAllUsers({ page: 1, limit: 10 });
    expect(result).toBeInstanceOf(PaginatedResponseDto);
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should return user by username', async () => {
    const result = await controller.getUserByUsername('testuser');
    expect(result).toBeInstanceOf(UserDto);
    expect(result.username).toBe('testuser');
  });

  it('should return an exception if user with such username not found', async () => {
    jest
      .spyOn(service, 'getUserByUsername')
      .mockRejectedValueOnce(new NotFoundException('User not found'));

    try {
      await controller.getUserByUsername('nottestuser');
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toBe('User not found');
    }
  });

  it('should return user by email', async () => {
    const result = await controller.getUserByEmail({
      email: 'test@example.com',
    });
    expect(result).toBeInstanceOf(UserDto);
    expect(result.email).toBe('test@example.com');
  });

  it('should return an exception if user with such email not found', async () => {
    jest
      .spyOn(service, 'getUserByEmail')
      .mockRejectedValueOnce(new NotFoundException('User not found'));

    try {
      await controller.getUserByEmail('nottest@example.com');
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toBe('User not found');
    }
  });

  it('should update user and return updated data', async () => {
    const result = await controller.updateUser('testuser', {
      username: 'updated',
    } as UpdateUserDto);
    expect(result).toBeInstanceOf(UserDto);
    expect(result.username).toBe('updated');
  });

  it('should delete user and return success message', async () => {
    const result = await controller.deleteUser('testuser');
    expect(result).toBe('user deleted successfully');
  });
});
