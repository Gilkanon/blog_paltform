import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import CreatePostDto from './dto/create-post.dto';
import UpdatePostDto from './dto/update-post.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { getPaginationParams } from 'src/common/utils/pagination.util';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async getAllPosts(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const { skip, take } = getPaginationParams(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.post.findMany({ skip, take }),
      this.prisma.post.count(),
    ]);
    return { data, total };
  }

  async getPostById(id: number) {
    const post = await this.prisma.post.findUnique({ where: { id: id } });

    if (!post) {
      throw new NotFoundException(`Post is not found`);
    }

    return post;
  }

  async getPostsByUsername(username: string, paginationDto: PaginationDto) {
    const user = await this.usersService.getUserByUsername(username);
    const { page, limit } = paginationDto;
    const { skip, take } = getPaginationParams(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.post.findMany({ where: { authorId: user.id }, skip, take }),
      this.prisma.post.count({ where: { authorId: user.id } }),
    ]);

    if (!data) {
      throw new NotFoundException(`Posts not found`);
    }

    return { data, total };
  }

  async getCurrentPostByUsername(username: string, postId: number) {
    const user = await this.usersService.getUserByUsername(username);
    const post = await this.prisma.post.findFirst({
      where: { authorId: user.id, id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Post not found`);
    }

    return post;
  }

  async createPost(createPostDto: CreatePostDto, username: string) {
    const user = await this.usersService.getUserByUsername(username);
    const authorId = user.id;

    const { title, content } = createPostDto;
    const post = await this.prisma.post.create({
      data: {
        title,
        content,
        authorId,
      },
    });

    return post;
  }

  async updatePost(username: string, id: number, updatePostDto: UpdatePostDto) {
    const existingPost = await this.prisma.post.findFirst({
      where: {
        id,
        author: {
          username,
        },
      },
    });

    if (!existingPost) {
      throw new NotFoundException(`Post not found`);
    }

    const { title, content } = updatePostDto;

    const post = await this.prisma.post.update({
      where: { id: id },
      data: {
        title,
        content,
      },
    });

    return post;
  }

  async deletePost(username: string, id: number) {
    const existingPost = await this.prisma.post.findFirst({
      where: {
        id,
        author: {
          username,
        },
      },
    });

    if (!existingPost) {
      throw new NotFoundException(`Post not found`);
    }

    const post = await this.prisma.post.delete({
      where: { id: id },
    });

    return `Post ${post.title} deleted`;
  }

  async voteOnPost(postId: number, username: string, voteValue: 1 | -1) {
    const user = await this.usersService.getUserByUsername(username);
    const userId = user.id;

    const existingVote = await this.prisma.vote.findFirst({
      where: { postId, userId },
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
          postId,
          userId,
          value: voteValue,
        },
      });
    }

    const votes = await this.prisma.vote.findMany({ where: { postId } });
    const rating = votes.reduce((acc, vote) => acc + vote.value, 0);

    await this.prisma.post.update({
      where: { id: postId },
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
