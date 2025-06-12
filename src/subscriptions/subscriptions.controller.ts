import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
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
  ApiQuery,
} from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Role } from '@prisma/client';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

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
    @GetUser('username') username: string,
  ) {
    const subscription = await this.subscriptionsService.createSubscription(
      createSubscriptionDto,
      username,
    );

    return plainToInstance(SubscriptionDto, subscription);
  }

  @Get('/users/:username')
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Roles(Role.MODERATOR)
  @ApiOkResponse({
    description: 'Get all subscriptions of a user to other users',
    type: PaginatedResponseDto,
  })
  async getUsersSubscriptionsByUsername(
    @Param('username') username: string,
    @Query() paginationDto: PaginationDto,
  ) {
    const { data, total } =
      await this.subscriptionsService.getUserSubscriptionsByUsername(
        username,
        paginationDto,
      );

    return new PaginatedResponseDto<SubscriptionDto>({
      data: data.map((subscription) =>
        plainToInstance(SubscriptionDto, subscription),
      ),
      total,
      page: paginationDto.page,
      limit: paginationDto.limit,
    });
  }

  @Get('posts/:username')
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Roles(Role.MODERATOR)
  @ApiOkResponse({
    description: 'Get all subscriptions for a post',
    type: PaginatedResponseDto,
  })
  async getPostSubscriptionsByUsername(
    @Param('username') username: string,
    @Query() paginationDto: PaginationDto,
  ) {
    const { data, total } =
      await this.subscriptionsService.getPostSubscriptionsByUsername(
        username,
        paginationDto,
      );

    return new PaginatedResponseDto<SubscriptionDto>({
      data: data.map((subscription) =>
        plainToInstance(SubscriptionDto, subscription),
      ),
      total,
      page: paginationDto.page,
      limit: paginationDto.limit,
    });
  }

  @Get('/post/subscribers/:postId')
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Roles(Role.USER)
  @ApiOkResponse({
    description: 'Get all subscribers for a post',
    type: PaginatedResponseDto,
  })
  async getPostSubscribers(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    const { data, total } = await this.subscriptionsService.getPostSubscribers(
      postId,
      paginationDto,
    );

    return new PaginatedResponseDto<SubscriptionDto>({
      data: data.map((subscription) =>
        plainToInstance(SubscriptionDto, subscription),
      ),
      total,
      page: paginationDto.page,
      limit: paginationDto.limit,
    });
  }

  @Get('/user/subscribers/:username')
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Roles(Role.MODERATOR)
  @ApiOkResponse({
    description: 'Get all subscribers for a user',
    type: PaginatedResponseDto,
  })
  async getUserSubscribers(
    @Param('username') username: string,
    @Query() paginationDto: PaginationDto,
  ) {
    const { data, total } = await this.subscriptionsService.getUserSubscribers(
      username,
      paginationDto,
    );

    return new PaginatedResponseDto<SubscriptionDto>({
      data: data.map((subscription) =>
        plainToInstance(SubscriptionDto, subscription),
      ),
      total,
      page: paginationDto.page,
      limit: paginationDto.limit,
    });
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
