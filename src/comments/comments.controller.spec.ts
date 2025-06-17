import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import CommentDto from './dto/comment.dto';
import { VoteDto } from 'src/common/dto/vote.dto';
import { NotFoundException } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';

const mockComment = {
  id: 1,
  content: 'comment content',
  postId: 1,
  userId: 'alexId',
  parentId: null,
  replies: [],
};

const mockCommentsService = {
  getAllPostComments: jest
    .fn()
    .mockReturnValue({ data: [mockComment], total: 1 }),
  getAllUserComments: jest
    .fn()
    .mockReturnValue({ data: [mockComment], total: 1 }),
  getCommentById: jest.fn().mockReturnValue(mockComment),
  createComment: jest.fn().mockReturnValue(mockComment),
  updateComment: jest
    .fn()
    .mockReturnValue({ ...mockComment, content: 'updated' }),
  deleteComment: jest
    .fn()
    .mockReturnValue({ message: 'comment deleted successfully' }),
  voteComment: jest.fn().mockReturnValue({ rating: 1, message: 'Vote added' }),
};

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: CommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [{ provide: CommentsService, useValue: mockCommentsService }],
      imports: [PrismaModule],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    service = module.get<CommentsService>(CommentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return paginated list comments of post', async () => {
    const result = await controller.getAllPostComments(1, {
      page: 1,
      limit: 10,
    });
    expect(result).toBeInstanceOf(PaginatedResponseDto);
    expect(service.getAllPostComments).toHaveBeenCalledWith(1, {
      page: 1,
      limit: 10,
    });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should return paginated list of user comments', async () => {
    const result = await controller.getAllUserComments('alex', {
      page: 1,
      limit: 10,
    });
    expect(result).toBeInstanceOf(PaginatedResponseDto);
    expect(service.getAllUserComments).toHaveBeenCalledWith('alex', {
      page: 1,
      limit: 10,
    });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should return current comment by id', async () => {
    const result = await controller.getCommentById(1);
    expect(result).toBeInstanceOf(CommentDto);
    expect(service.getCommentById).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockComment);
  });

  it('should return an exception if comment with such id not found', async () => {
    jest
      .spyOn(service, 'getCommentById')
      .mockRejectedValueOnce(new NotFoundException('Comment not found'));

    try {
      await controller.getCommentById(2);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toEqual('Comment not found');
    }
  });

  it('should create a new comment to post', async () => {
    const result = await controller.createComment(
      1,
      { content: 'some content' },
      'alex',
    );
    expect(result).toBeInstanceOf(CommentDto);
    expect(service.createComment).toHaveBeenCalledWith(
      'some content',
      1,
      'alex',
    );
    expect(result).toEqual(mockComment);
  });

  it('should create reply to existing comment', async () => {
    const result = await controller.createReply(
      1,
      1,
      { content: 'some content' },
      'alex',
    );
    expect(result).toBeInstanceOf(CommentDto);
    expect(service.createComment).toHaveBeenCalledWith(
      'some content',
      1,
      'alex',
      1,
    );
    expect(result).toEqual(mockComment);
  });

  it('should update comment data', async () => {
    const result = await controller.updateComment(1, {
      content: 'some content',
    });
    expect(result).toBeInstanceOf(CommentDto);
    expect(service.updateComment).toHaveBeenCalledWith(1, 'some content');
    expect(result.content).toEqual('updated');
  });

  it('should delete comment', async () => {
    const result = await controller.deleteComment(1);
    expect(result).toEqual({ message: 'comment deleted successfully' });
    expect(service.deleteComment).toHaveBeenCalledWith(1);
  });

  it('should vote on comment', async () => {
    const result = await controller.voteComment(1, 'alex', { voteValue: 1 });
    expect(result).toBeInstanceOf(VoteDto);
    expect(service.voteComment).toHaveBeenCalledWith(1, 'alex', 1);
    expect(result.rating).toEqual(1);
    expect(result.message).toEqual('Vote added');
  });
});
