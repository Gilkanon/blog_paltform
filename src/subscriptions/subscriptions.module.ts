import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  imports: [PrismaModule, UsersModule],
})
export class SubscriptionsModule {}
