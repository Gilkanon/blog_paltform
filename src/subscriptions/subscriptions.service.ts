import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UsersService } from 'src/users/users.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { getPaginationParams } from 'src/common/utils/pagination.util';

@Injectable()
export class SubscriptionsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async createSubscription(
    createSubscriptionDto: CreateSubscriptionDto,
    username: string,
  ) {
    const { targetType, postId, userTargetId } = createSubscriptionDto;
    const user = await this.usersService.getUserByUsername(username);
    const userId = user.id;

    if (targetType === 'POST') {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
      });
      if (!post) {
        throw new NotFoundException(`Post with ID ${postId} not found`);
      }
      const isSubbed = await this.prisma.subscription.findFirst({
        where: { userId: user.id, postId: postId },
      });
      if (isSubbed) {
        throw new BadRequestException('Cannot subscribe to same post twice');
      }
    } else if (targetType === 'USER') {
      const user = await this.prisma.user.findUnique({
        where: { id: userTargetId },
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${userTargetId} not found`);
      }
      if (user.id === userId) {
        throw new BadRequestException('Cannot subscribe to yourself');
      }
    }
    return this.prisma.subscription.create({
      data: {
        targetType,
        postId: postId ?? null,
        userTargetId: userTargetId ?? null,
        userId,
      },
    });
  }

  async getUserSubscriptionsByUsername(
    username: string,
    paginationDto: PaginationDto,
  ) {
    const user = await this.usersService.getUserByUsername(username);
    const { page, limit } = paginationDto;
    const { skip, take } = getPaginationParams(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where: { targetType: 'USER', userId: user.id },
        skip,
        take,
      }),
      this.prisma.subscription.count({
        where: { targetType: 'USER', userId: user.id },
      }),
    ]);

    return { data, total };
  }

  async getPostSubscriptionsByUsername(
    username: string,
    paginationDto: PaginationDto,
  ) {
    const user = await this.usersService.getUserByUsername(username);

    const { page, limit } = paginationDto;
    const { skip, take } = getPaginationParams(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where: { targetType: 'POST', userId: user.id },
        skip,
        take,
      }),
      this.prisma.subscription.count({
        where: { targetType: 'POST', userId: user.id },
      }),
    ]);

    return { data, total };
  }

  async getUserSubscribers(username: string, paginationDto: PaginationDto) {
    const user = await this.usersService.getUserByUsername(username);
    const { page, limit } = paginationDto;
    const { skip, take } = getPaginationParams(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where: { targetType: 'USER', userTargetId: user.id },
        skip,
        take,
      }),
      this.prisma.subscription.count({
        where: { targetType: 'USER', userTargetId: user.id },
      }),
    ]);

    return { data, total };
  }

  async getPostSubscribers(postId: number, paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const { skip, take } = getPaginationParams(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where: { targetType: 'POST', postId: postId },
        skip,
        take,
      }),
      this.prisma.subscription.count({
        where: { targetType: 'POST', postId: postId },
      }),
    ]);

    return { data, total };
  }

  async deleteSubscription(username: string, id: number) {
    const existingSubscription = await this.prisma.subscription.findFirst({
      where: {
        id: id,
        user: {
          username: username,
        },
      },
    });

    if (!existingSubscription) {
      throw new NotFoundException(`Subscription not found`);
    }

    const subscription = await this.prisma.subscription.delete({
      where: { id: id },
    });

    return `Subscription to ${subscription.targetType} deleted`;
  }
}
