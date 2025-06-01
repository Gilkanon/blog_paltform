import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { PostsModule } from 'src/posts/posts.module';

@Module({
  providers: [CommentsService],
  controllers: [CommentsController],
  imports: [PrismaModule, UsersModule, PostsModule],
})
export class CommentsModule {}
