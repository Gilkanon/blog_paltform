import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import CreateUserDto from './dto/create-user.dto';
import UpdateUserDto from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers() {
    const users = await this.prisma.user.findMany();
    return users;
  }

  async getUserByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username: username },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async createUser(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: createUserDto,
    });

    return user;
  }

  async getUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateUser(username: string, updateUserDto: UpdateUserDto) {
    const user = await this.getUserByUsername(username);

    if (updateUserDto.password) {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      updateUserDto.password = hashedPassword;
    }

    const updatedUser = await this.prisma.user.update({
      where: { username: user.username },
      data: updateUserDto,
    });

    return updatedUser;
  }

  async deleteUser(username: string) {
    const user = await this.getUserByUsername(username);

    await this.prisma.user.delete({
      where: { username: user.username },
    });

    return { message: 'User deleted successfully' };
  }
}
