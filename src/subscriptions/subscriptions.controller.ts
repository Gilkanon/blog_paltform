import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { plainToInstance } from 'class-transformer';
import { SubscriptionDto } from './dto/subscription.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Role } from '@prisma/client';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Post('subscribe')
  @ApiBearerAuth()
  @Roles(Role.USER)
  @ApiCreatedResponse({
    description: 'Create a new subscription',
    type: SubscriptionDto,
  })
  async createSubscription(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @GetUser() username: string,
  ) {
    const subscription = await this.subscriptionsService.createSubscription(
      createSubscriptionDto,
      username,
    );

    return plainToInstance(SubscriptionDto, subscription);
  }

  @Get('/users/:username')
  @ApiBearerAuth()
  @Roles(Role.MODERATOR)
  @ApiOkResponse({
    description: 'Get all subscriptions of a user to other users',
    type: SubscriptionDto,
    isArray: true,
  })
  async getUsersSubscriptionsByUsername(@Param('username') username: string) {
    const subscriptions =
      await this.subscriptionsService.getUserSubscriptionsByUsername(username);

    return subscriptions.map((subscription) =>
      plainToInstance(SubscriptionDto, subscription),
    );
  }

  @Get('posts/:username')
  @ApiBearerAuth()
  @Roles(Role.MODERATOR)
  @ApiOkResponse({
    description: 'Get all subscriptions for a post',
    type: SubscriptionDto,
    isArray: true,
  })
  async getPostSubscriptions(@Param('username') username: string) {
    const subscriptions =
      await this.subscriptionsService.getPostSubscriptionsByUsername(username);

    return subscriptions.map((subscription) =>
      plainToInstance(SubscriptionDto, subscription),
    );
  }

  @Get('/post/subscribers/:postId')
  @ApiBearerAuth()
  @Roles(Role.USER)
  @ApiOkResponse({
    description: 'Get all subscribers for a post',
    type: SubscriptionDto,
    isArray: true,
  })
  async getPostSubscribers(@Param('postId', ParseIntPipe) postId: number) {
    const subscriptions =
      await this.subscriptionsService.getPostsSubscribers(postId);

    return subscriptions.map((subscription) =>
      plainToInstance(SubscriptionDto, subscription),
    );
  }

  @Get('/user/subscribers/:username')
  @ApiBearerAuth()
  @Roles(Role.MODERATOR)
  @ApiOkResponse({
    description: 'Get all subscribers for a user',
    type: SubscriptionDto,
    isArray: true,
  })
  async getUserSubscribers(@Param('username') username: string) {
    const subscriptions =
      await this.subscriptionsService.getUserSubscribers(username);

    return subscriptions.map((subscription) =>
      plainToInstance(SubscriptionDto, subscription),
    );
  }

  @Delete('/delete/:username/:id')
  @ApiBearerAuth()
  @Roles(Role.MODERATOR)
  @ApiOkResponse({ description: 'Delete subscription by id' })
  async deleteSubscription(
    @Param('username') username: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.subscriptionsService.deleteSubscription(username, id);
  }
}
