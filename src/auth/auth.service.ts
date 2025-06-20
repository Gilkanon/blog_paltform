import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import SignUpDto from './dto/sign-up.dto';
import SignInDto from './dto/sign-in.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomBytes } from 'crypto';
import JwtPayload from './interfaces/jwt-payload.interface';
import { GoogleProfile } from './interfaces/google-profile.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const { username, email, password, confirmPassword } = signUpDto;

    if (password !== confirmPassword) {
      throw new UnauthorizedException('Passwords do not match');
    }

    const existingUsername =
      await this.usersService.checkUserExistsByUsername(username);
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    const existingEmail = await this.usersService.checkUserExistsByEmail(email);
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.usersService.createUser({
      username,
      email,
      password,
    });

    return this.signIn({ username, password });
  }

  async signIn(signInDto: SignInDto) {
    const { username, password } = signInDto;

    const user = await this.usersService.getUserByUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = { username: user.username, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn:
        this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m',
    });
    const refreshToken = randomBytes(64).toString('hex');

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        role: user.role,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateOAuthUser(profile: GoogleProfile) {
    const { email, name } = profile;

    let user = await this.usersService.getUserByEmail(email);

    if (!user) {
      user = await this.usersService.createUser({
        username: name || email.split('@')[0],
        email,
        password: randomBytes(16).toString('hex'),
      });
    }

    const payload: JwtPayload = { username: user.username, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn:
        this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m',
    });

    const refreshToken = randomBytes(64).toString('hex');

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        role: user.role,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    const token = await this.prisma.refreshToken.findFirst({
      where: { token: refreshToken },
    });

    if (!token || token.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.getUserById(token.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const payload: JwtPayload = { username: user.username, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn:
        this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m',
    });

    const newRefreshToken = randomBytes(64).toString('hex');

    await this.prisma.refreshToken.update({
      where: { id: token.id },
      data: {
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    const deleted = await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });

    if (deleted.count === 0) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
