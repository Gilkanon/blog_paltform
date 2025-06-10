import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import UpdateUserDto from './dto/update-user.dto';
import { plainToInstance } from 'class-transformer';
import UserDto from './dto/user.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/all')
  @Roles(Role.USER)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Get all users',
    type: PaginatedResponseDto,
  })
  async getAllUsers(@Query() paginationDto: PaginationDto) {
    const { data, total } = await this.usersService.getAllUsers(paginationDto);

    return new PaginatedResponseDto<UserDto>({
      data: data.map((user) => plainToInstance(UserDto, user)),
      total,
      page: paginationDto.page,
      limit: paginationDto.limit,
    });
  }

  @Get('/username/:username')
  @Roles(Role.USER)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Get user by username',
    type: UserDto,
  })
  async getUserByUsername(@Param('username') username: string) {
    const user = await this.usersService.getUserByUsername(username);

    return plainToInstance(UserDto, user);
  }

  @Post('/email')
  @Roles(Role.MODERATOR)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Get user by email',
    type: UserDto,
  })
  async getUserByEmail(@Body() email: string) {
    const user = await this.usersService.getUserByEmail(email);

    return plainToInstance(UserDto, user);
  }

  @Patch('/username/:username')
  @Roles(Role.MODERATOR)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Update user by username',
    type: UserDto,
  })
  async updateUser(
    @Param('username') username: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.updateUser(username, updateUserDto);

    return plainToInstance(UserDto, user);
  }

  @Delete('/username/:username')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Delete user by username',
    type: UserDto,
  })
  async deleteUser(@Param('username') username: string) {
    await this.usersService.deleteUser(username);

    return 'user deleted successfully';
  }
}
