import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { plainToInstance } from 'class-transformer';
import PostDto from './dto/post.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import UpdatePostDto from './dto/update-post.dto';
import CreatePostDto from './dto/create-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}
  @Get()
  @Public()
  @ApiOkResponse({
    description: 'Get all posts',
    type: PostDto,
    isArray: true,
  })
  async getAllPosts() {
    const posts = await this.postsService.getAllPosts();

    return posts.map((post) => plainToInstance(PostDto, post));
  }

  @Get(':id')
  @Public()
  @ApiOkResponse({
    description: 'Get post by id',
    type: PostDto,
  })
  async getPostById(@Param('id', ParseIntPipe) id: number) {
    const post = await this.postsService.getPostById(id);

    return plainToInstance(PostDto, post);
  }

  @Get('user/:username')
  @Public()
  @ApiOkResponse({
    description: 'Get posts by username',
    type: PostDto,
    isArray: true,
  })
  async getPostsByUsername(@Param('username') username: string) {
    const posts = await this.postsService.getPostsByUsername(username);

    return posts.map((post) => plainToInstance(PostDto, post));
  }

  @Get('user/:username/:postId')
  @Public()
  @ApiOkResponse({
    description: 'Get current post by username and postId',
    type: PostDto,
  })
  async getCurrentPostByUsername(
    @Param('username') username: string,
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    const post = await this.postsService.getCurrentPostByUsername(
      username,
      postId,
    );

    return plainToInstance(PostDto, post);
  }

  @Post('create')
  @ApiBearerAuth()
  @Roles(Role.USER)
  @ApiCreatedResponse({
    description: 'Create a new post',
    type: PostDto,
  })
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @GetUser('username') username: string,
  ) {
    const post = await this.postsService.createPost(createPostDto, username);

    return plainToInstance(PostDto, post);
  }

  @Patch('update/:username/:id')
  @ApiBearerAuth()
  @Roles(Role.MODERATOR)
  @ApiOkResponse({
    description: 'Update post by id',
    type: PostDto,
  })
  async updatePost(
    @Param('username') username: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    const post = await this.postsService.updatePost(
      username,
      id,
      updatePostDto,
    );

    return plainToInstance(PostDto, post);
  }

  @Delete('delete/:username/:id')
  @ApiBearerAuth()
  @Roles(Role.MODERATOR)
  @ApiOkResponse({
    description: 'Delete post by id',
    type: PostDto,
  })
  async deletePost(
    @Param('username') username: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.postsService.deletePost(username, id);
  }
}
