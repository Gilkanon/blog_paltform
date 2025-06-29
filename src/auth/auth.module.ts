import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenCleanupService } from './token-cleanup.service';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  providers: [AuthService, JwtStrategy, TokenCleanupService, GoogleStrategy],
  controllers: [AuthController],
  imports: [
    PrismaModule,
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '15m' }, // Token expiration time
    }),
  ],
  exports: [PassportModule, JwtModule],
})
export class AuthModule {}
