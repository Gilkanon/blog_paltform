import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RolesGuard } from './common/guards/roles.guard';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SubscriptionsService } from './subscriptions/subscriptions.service';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    AuthModule,
    PostsModule,
    CommentsModule,
    ScheduleModule.forRoot(),
    SubscriptionsModule,
  ],
  controllers: [],
  providers: [
    PrismaService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    SubscriptionsService,
  ],
})
export class AppModule {}
