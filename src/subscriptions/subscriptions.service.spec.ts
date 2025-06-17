import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from './subscriptions.service';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockDB = [
  {
    id: 1,
    targetType: 'POST',
    postId: 1,
    userTargetId: null,
    userId: 'alexId',
  },
  {
    id: 2,
    targetType: 'USER',
    postId: null,
    userTargetId: 'johnId',
    userId: 'alexId',
  },
];

const mockSubscription = mockDB[0];

const mockPost = {
  id: 1,
  title: 'Test Post',
  content: 'This is a test post',
  userId: 'alexId',
};

const mockUser = {
  id: 'alexId',
  username: 'alex',
  email: 'alex@example.com',
  role: Role.USER,
};

const mockUsersService = {
  getUserByUsername: jest.fn().mockReturnValue(mockUser),
};

const mockPrisma = {
  subscription: {
    findMany: jest.fn().mockReturnValue(mockDB),
    findFirst: jest.fn().mockReturnValue(mockSubscription),
    create: jest.fn(({ data }) => {
      return { ...data, id: mockDB.length + 1 };
    }),
    delete: jest
      .fn()
      .mockReturnValue({ message: 'Subscription deleted successfully' }),
    count: jest.fn().mockReturnValue(mockDB.length),
  },
  post: {
    findUnique: jest.fn().mockReturnValue(mockPost),
  },
  user: {
    findUnique: jest.fn().mockReturnValue(mockUser),
  },
};

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let prisma: PrismaService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: UsersService, useValue: mockUsersService },
      ],
      imports: [PrismaModule, UsersModule],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
    prisma = module.get<PrismaService>(PrismaService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSubscription', () => {
    it('should create a subscription for a post', async () => {
      mockPrisma.subscription.findFirst.mockResolvedValueOnce(null);
      const result = await service.createSubscription(
        { targetType: 'POST', postId: 1 },
        'alex',
      );

      expect(mockUsersService.getUserByUsername).toHaveBeenCalledWith('alex');
      expect(mockPrisma.post.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrisma.subscription.findFirst).toHaveBeenCalledWith({
        where: { userId: mockUser.id, postId: 1 },
      });
      expect(result).toEqual({
        id: 3,
        targetType: 'POST',
        postId: 1,
        userTargetId: null,
        userId: 'alexId',
      });
    });

    it('should throw NotFoundException if post does not exist', async () => {
      mockPrisma.post.findUnique.mockResolvedValueOnce(null);
      await expect(
        service.createSubscription({ targetType: 'POST', postId: 999 }, 'alex'),
      ).rejects.toThrow('Post with ID 999 not found');
    });

    it('should throw BadRequestException if subscribing to same post', async () => {
      mockPrisma.subscription.findFirst.mockResolvedValueOnce(mockSubscription);
      await expect(
        service.createSubscription({ targetType: 'POST', postId: 1 }, 'alex'),
      ).rejects.toThrow('Cannot subscribe to same post twice');
    });

    it('should create a subscription for a user', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'johnId' });
      const result = await service.createSubscription(
        { targetType: 'USER', userTargetId: 'johnId' },
        'alex',
      );

      expect(mockUsersService.getUserByUsername).toHaveBeenCalledWith('alex');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'johnId' },
      });
      expect(result).toEqual({
        id: 3,
        targetType: 'USER',
        postId: null,
        userTargetId: 'johnId',
        userId: 'alexId',
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      await expect(
        service.createSubscription(
          { targetType: 'USER', userTargetId: 'unknownId' },
          'alex',
        ),
      ).rejects.toThrow('User with ID unknownId not found');
    });

    it('should throw BadRequestException if subscribing to self', async () => {
      await expect(
        service.createSubscription(
          { targetType: 'USER', userTargetId: 'alexId' },
          'alex',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteSubscription', () => {
    it('should delete a subscription', async () => {
      mockPrisma.subscription.findFirst.mockResolvedValueOnce({
        id: 1,
        targetType: 'POST',
      });
      mockPrisma.subscription.delete.mockResolvedValueOnce({
        targetType: 'POST',
      });
      const result = await service.deleteSubscription('alex', 1);
      expect(result).toBe('Subscription to POST deleted');
    });

    it('should throw NotFoundException if subscription not found', async () => {
      mockPrisma.subscription.findFirst.mockResolvedValueOnce(null);
      await expect(service.deleteSubscription('alex', 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUserSubscriptionsByUsername', () => {
    it('should return paginated user subscriptions', async () => {
      const result = await service.getUserSubscriptionsByUsername('alex', {
        page: 1,
        limit: 10,
      });
      expect(result.data).toEqual(mockDB);
      expect(result.total).toBe(mockDB.length);
    });
  });

  describe('getPostSubscriptionsByUsername', () => {
    it('should return paginated post subscriptions', async () => {
      const result = await service.getPostSubscriptionsByUsername('alex', {
        page: 1,
        limit: 10,
      });
      expect(result.data).toEqual(mockDB);
      expect(result.total).toBe(mockDB.length);
    });
  });

  describe('getUserSubscribers', () => {
    it('should return user subscribers', async () => {
      const result = await service.getUserSubscribers('alex', {
        page: 1,
        limit: 10,
      });
      expect(result.data).toEqual(mockDB);
      expect(result.total).toBe(mockDB.length);
    });
  });

  describe('getPostSubscribers', () => {
    it('should return post subscribers', async () => {
      const result = await service.getPostSubscribers(1, {
        page: 1,
        limit: 10,
      });
      expect(result.data).toEqual(mockDB);
      expect(result.total).toBe(mockDB.length);
    });
  });
});
