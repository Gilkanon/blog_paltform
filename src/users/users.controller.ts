import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import UpdateUserDto from './dto/update-user.dto';
import { plainToInstance } from 'class-transformer';
import UserDto from './dto/user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guards';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Get all users',
    type: UserDto,
    isArray: true,
  })
  async getAllUsers() {
    const users = await this.usersService.getAllUsers();

    return users.map((user) => plainToInstance(UserDto, user));
  }

  @Get('/username/:username')
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
