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
import { CommentsService } from './comments.service';
import { Public } from 'src/common/decorators/public.decorator';
import { plainToInstance } from 'class-transformer';
import CommentDto from './dto/comment.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import CommentContentDto from './dto/comment-content.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { VoteValueDto } from '../common/dto/vote-value.dto';
import { VoteDto } from '../common/dto/vote.dto';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Public()
  @Get('/post/:postId')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({
    description: 'Returns all comments for a specific post',
    type: PaginatedResponseDto,
  })
  async getAllPostComments(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    const { data, total } = await this.commentsService.getAllPostComments(
      postId,
      paginationDto,
    );

    return new PaginatedResponseDto<CommentDto>({
      data: data.map((comment) => plainToInstance(CommentDto, comment)),
      total,
      page: paginationDto.page,
      limit: paginationDto.limit,
    });
  }

  @Public()
  @Get('/user/:username')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({
    description: 'Returns all comments made by a specific user',
    type: PaginatedResponseDto,
  })
  async getAllUserComments(
    @Param('username') username: string,
    @Query() paginationDto: PaginationDto,
  ) {
    const { data, total } = await this.commentsService.getAllUserComments(
      username,
      paginationDto,
    );

    return new PaginatedResponseDto<CommentDto>({
      data: data.map((comment) => plainToInstance(CommentDto, comment)),
      total,
      page: paginationDto.page,
      limit: paginationDto.limit,
    });
  }

  @Public()
  @Get('/:id')
  @ApiOkResponse({
    description: 'Returns a specific comment by its ID',
    type: CommentDto,
  })
  async getCommentById(@Param('id', ParseIntPipe) id: number) {
    const comment = await this.commentsService.getCommentById(id);

    return plainToInstance(CommentDto, comment);
  }

  @Post('/create/:postId')
  @ApiBearerAuth()
  @Roles(Role.USER)
  @ApiCreatedResponse({
    description: 'Creates a new comment on a post',
    type: CommentDto,
  })
  async createComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() contentDto: CommentContentDto,
    @GetUser('username') username: string,
  ) {
    const { content } = contentDto;
    const comment = await this.commentsService.createComment(
      content,
      postId,
      username,
    );

    return plainToInstance(CommentDto, comment);
  }

  @Post('/create/:postId/reply/:parentId')
  @ApiBearerAuth()
  @Roles(Role.USER)
  @ApiCreatedResponse({
    description: 'Creates a reply to an existing comment',
    type: CommentDto,
  })
  async createReply(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('parentId', ParseIntPipe) parentId: number,
    @Body() contentDto: CommentContentDto,
    @GetUser('username') username: string,
  ) {
    const { content } = contentDto;
    const reply = await this.commentsService.createComment(
      content,
      postId,
      username,
      parentId,
    );

    return plainToInstance(CommentDto, reply);
  }

  @Patch('update/:id')
  @ApiBearerAuth()
  @Roles(Role.MODERATOR)
  @ApiOkResponse({
    description: 'Updates an existing comment',
    type: CommentDto,
  })
  async updateComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() contentDto: CommentContentDto,
  ) {
    const { content } = contentDto;
    const comment = await this.commentsService.updateComment(id, content);
    return plainToInstance(CommentDto, comment);
  }

  @Delete('delete/:id')
  @ApiBearerAuth()
  @Roles(Role.MODERATOR)
  @ApiOkResponse({
    description: 'Deletes a comment by its ID',
  })
  async deleteComment(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.deleteComment(id);
  }

  @Post('vote/comment/:commentId')
  @ApiBearerAuth()
  @Roles(Role.USER)
  @ApiOkResponse({
    description: 'Votes on a comment',
    type: CommentDto,
  })
  async voteComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @GetUser('username') username: string,
    @Body() voteValueDto: VoteValueDto,
  ) {
    const { voteValue } = voteValueDto;
    const comment = await this.commentsService.voteComment(
      commentId,
      username,
      voteValue,
    );
    return plainToInstance(VoteDto, comment);
  }
}
