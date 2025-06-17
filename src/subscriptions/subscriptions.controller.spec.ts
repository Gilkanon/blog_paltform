import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsController } from './subscriptions.controller';
import { TargetType } from '@prisma/client';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionDto } from './dto/subscription.dto';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';

const mockSubscription = {
  id: 1,
  targetType: TargetType.POST,
  postId: 1,
  userTargetId: null,
  userId: 'alexId',
};

const mockSubscriptionsService = {
  createSubscription: jest.fn().mockReturnValue(mockSubscription),
  getUserSubscriptionsByUsername: jest
    .fn()
    .mockReturnValue({ data: [mockSubscription], total: 1 }),
  getPostSubscriptionsByUsername: jest
    .fn()
    .mockReturnValue({ data: [mockSubscription], total: 1 }),
  getUserSubscribers: jest
    .fn()
    .mockReturnValue({ data: [mockSubscription], total: 1 }),
  getPostSubscribers: jest
    .fn()
    .mockReturnValue({ data: [mockSubscription], total: 1 }),
  deleteSubscription: jest
    .fn()
    .mockReturnValue({ message: 'Subscription deleted successfully' }),
};

describe('SubscriptionsController', () => {
  let controller: SubscriptionsController;
  let service: SubscriptionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionsController],
      providers: [
        {
          provide: SubscriptionsService,
          useValue: mockSubscriptionsService,
        },
      ],
      imports: [PrismaModule],
    }).compile();

    controller = module.get<SubscriptionsController>(SubscriptionsController);
    service = module.get<SubscriptionsService>(SubscriptionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a subscription and return SubscriptionDto', async () => {
    const dto: CreateSubscriptionDto = {
      targetType: TargetType.POST,
      postId: 1,
    };
    const result = await controller.createSubscription(dto, 'alex');

    expect(service.createSubscription).toHaveBeenCalledWith(dto, 'alex');
    expect(result).toEqual(expect.objectContaining({ id: 1 }));
    expect(result).toBeInstanceOf(SubscriptionDto);
  });

  it('should return user subscriptions with pagination', async () => {
    const result = await controller.getUsersSubscriptionsByUsername('alex', {
      page: 1,
      limit: 10,
    });

    expect(service.getUserSubscriptionsByUsername).toHaveBeenCalledWith(
      'alex',
      { page: 1, limit: 10 },
    );
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result).toBeInstanceOf(PaginatedResponseDto);
  });

  it('should return post subscriptions with pagination', async () => {
    const result = await controller.getPostSubscriptionsByUsername('alex', {
      page: 1,
      limit: 10,
    });

    expect(service.getPostSubscriptionsByUsername).toHaveBeenCalledWith(
      'alex',
      { page: 1, limit: 10 },
    );
    expect(result.data).toHaveLength(1);
    expect(result).toBeInstanceOf(PaginatedResponseDto);
  });

  it('should return subscribers for a post', async () => {
    const result = await controller.getPostSubscribers(1, {
      page: 1,
      limit: 10,
    });

    expect(service.getPostSubscribers).toHaveBeenCalledWith(1, {
      page: 1,
      limit: 10,
    });
    expect(result.data).toHaveLength(1);
    expect(result).toBeInstanceOf(PaginatedResponseDto);
  });

  it('should return subscribers for a user', async () => {
    const result = await controller.getUserSubscribers('alex', {
      page: 1,
      limit: 10,
    });

    expect(service.getUserSubscribers).toHaveBeenCalledWith('alex', {
      page: 1,
      limit: 10,
    });
    expect(result.data).toHaveLength(1);
    expect(result).toBeInstanceOf(PaginatedResponseDto);
  });

  it('should delete a subscription by id', async () => {
    const result = await controller.deleteSubscription('alex', 1);

    expect(service.deleteSubscription).toHaveBeenCalledWith('alex', 1);
    expect(result).toEqual({ message: 'Subscription deleted successfully' });
  });
});
