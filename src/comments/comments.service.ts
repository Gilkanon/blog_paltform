import { Injectable } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { getPaginationParams } from 'src/common/utils/pagination.util';
import { PostsService } from 'src/posts/posts.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private postsService: PostsService,
  ) {}

  async getAllPostComments(postId: number, paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const { skip, take } = getPaginationParams(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.comment.findMany({ where: { postId: postId }, skip, take }),
      this.prisma.comment.count({ where: { postId: postId } }),
    ]);

    if (!data) {
      throw new Error(`Comments not found for post`);
    }

    return { data, total };
  }

  async getAllUserComments(username: string, paginationDto: PaginationDto) {
    const user = await this.usersService.getUserByUsername(username);
    if (!user) {
      throw new Error(`User not found`);
    }

    const { page, limit } = paginationDto;
    const { skip, take } = getPaginationParams(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { authorId: user.id },
        skip,
        take,
      }),
      this.prisma.comment.count({ where: { authorId: user.id } }),
    ]);

    if (!data) {
      throw new Error(`Comments not found for user`);
    }

    return { data, total };
  }

  async getCommentById(id: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: id },
    });
    if (!comment) {
      throw new Error(`Comment not found`);
    }

    return comment;
  }

  async createComment(
    content: string,
    postId: number,
    username: string,
    parentId?: number,
  ) {
    const user = await this.usersService.getUserByUsername(username);
    if (!user) {
      throw new Error(`User not found`);
    }

    const post = await this.postsService.getPostById(postId);
    if (!post) {
      throw new Error(`Post not found`);
    }

    const comment = await this.prisma.comment.create({
      data: {
        content,
        postId,
        authorId: user.id,
        parentId: parentId || null,
      },
    });

    return comment;
  }

  async updateComment(id: number, content: string) {
    const comment = await this.prisma.comment.update({
      where: { id: id },
      data: { content },
    });
    if (!comment) {
      throw new Error(`Comment not found`);
    }

    return comment;
  }

  async deleteComment(id: number) {
    const comment = await this.prisma.comment.delete({
      where: { id: id },
    });
    if (!comment) {
      throw new Error(`Comment not found`);
    }

    return 'comment deleted successfully';
  }

  async voteComment(commentId: number, username: string, voteValue: 1 | -1) {
    const user = await this.usersService.getUserByUsername(username);
    const userId = user.id;

    const existingVote = await this.prisma.vote.findFirst({
      where: {
        commentId,
        userId,
      },
    });

    if (existingVote) {
      if (existingVote.value === voteValue) {
        await this.prisma.vote.delete({ where: { id: existingVote.id } });
      } else {
        await this.prisma.vote.update({
          where: { id: existingVote.id },
          data: { value: voteValue },
        });
      }
    } else {
      await this.prisma.vote.create({
        data: {
          commentId,
          userId,
          value: voteValue,
        },
      });
    }

    const votes = await this.prisma.vote.findMany({
      where: { commentId },
    });
    const rating = votes.reduce((acc, vote) => acc + vote.value, 0);

    this.prisma.comment.update({
      where: { id: commentId },
      data: { rating },
    });

    return {
      rating: rating,
      message: existingVote
        ? existingVote.value === voteValue
          ? 'Vote removed'
          : 'Vote updated'
        : 'Vote added',
    };
  }
}
