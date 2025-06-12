import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
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
  ApiQuery,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import UpdatePostDto from './dto/update-post.dto';
import CreatePostDto from './dto/create-post.dto';
import { VoteDto } from '../common/dto/vote.dto';
import { VoteValueDto } from '../common/dto/vote-value.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}
  @Get()
  @Public()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({
    description: 'Get all posts with pagination',
    type: PaginatedResponseDto,
  })
  async getAllPosts(@Query() paginationDto: PaginationDto) {
    const { data, total } = await this.postsService.getAllPosts(paginationDto);

    return new PaginatedResponseDto<PostDto>({
      data: data.map((post) => plainToInstance(PostDto, post)),
      total,
      page: paginationDto.page,
      limit: paginationDto.limit,
    });
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
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({
    description: 'Get posts by username',
    type: PaginatedResponseDto,
  })
  async getPostsByUsername(
    @Param('username') username: string,
    @Query() paginationDto: PaginationDto,
  ) {
    const { data, total } = await this.postsService.getPostsByUsername(
      username,
      paginationDto,
    );

    return new PaginatedResponseDto<PostDto>({
      data: data.map((post) => plainToInstance(PostDto, post)),
      total,
      page: paginationDto.page,
      limit: paginationDto.limit,
    });
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

  @Post('vote/post/:postId')
  @ApiBearerAuth()
  @Roles(Role.USER)
  @ApiOkResponse({
    description: 'Vote for a post',
    type: PostDto,
  })
  async votePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() voteValueDto: VoteValueDto,
    @GetUser('username') username: string,
  ) {
    const { voteValue } = voteValueDto;
    const vote = await this.postsService.voteOnPost(
      postId,
      username,
      voteValue,
    );
    return plainToInstance(VoteDto, vote);
  }
}
