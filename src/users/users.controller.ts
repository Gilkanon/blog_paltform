import { Controller, Delete, Get, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOkResponse } from '@nestjs/swagger';
import UserEntity from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/all')
  @ApiOkResponse({
    description: 'Get all users',
    type: UserEntity,
    isArray: true,
  })
  async getAllUsers() {
    const users = await this.usersService.getAllUsers();

    return users.map((user) => new UserEntity(user));
  }

  @Get('/username/:username')
  @ApiOkResponse({
    description: 'Get user by username',
    type: UserEntity,
  })
  async getUserByUsername(username: string) {
    const user = await this.usersService.getUserByUsername(username);

    return new UserEntity(user);
  }

  @Get('/email/:email')
  @ApiOkResponse({
    description: 'Get user by email',
    type: UserEntity,
  })
  async getUserByEmail(email: string) {
    const user = await this.usersService.getUserByEmail(email);

    return new UserEntity(user);
  }

  @Patch('/username/:username')
  @ApiOkResponse({
    description: 'Update user by username',
    type: UserEntity,
  })
  async updateUser(username: string, updateUserDto: any) {
    const user = await this.usersService.updateUser(username, updateUserDto);

    return new UserEntity(user);
  }

  @Delete('/username/:username')
  @ApiOkResponse({
    description: 'Delete user by username',
    type: UserEntity,
  })
  async deleteUser(username: string) {
    await this.usersService.deleteUser(username);

    return 'user deleted successfully';
  }
}
