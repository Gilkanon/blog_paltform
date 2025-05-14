import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOkResponse } from '@nestjs/swagger';
import UpdateUserDto from './dto/update-user.dto';
import { plainToInstance } from 'class-transformer';
import UserDto from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/all')
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
  @ApiOkResponse({
    description: 'Get user by username',
    type: UserDto,
  })
  async getUserByUsername(@Param('username') username: string) {
    const user = await this.usersService.getUserByUsername(username);

    return plainToInstance(UserDto, user);
  }

  @Get('/email/:email')
  @ApiOkResponse({
    description: 'Get user by email',
    type: UserDto,
  })
  async getUserByEmail(@Param('email') email: string) {
    const user = await this.usersService.getUserByEmail(email);

    return plainToInstance(UserDto, user);
  }

  @Patch('/username/:username')
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
  @ApiOkResponse({
    description: 'Delete user by username',
    type: UserDto,
  })
  async deleteUser(@Param('username') username: string) {
    await this.usersService.deleteUser(username);

    return 'user deleted successfully';
  }
}
