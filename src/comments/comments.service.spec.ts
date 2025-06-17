import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { PostsModule } from 'src/posts/posts.module';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { PostsService } from 'src/posts/posts.service';

const mockDB = [
  {
    id: 1,
    content: 'first comment',
    postId: 1,
    userId: 'alexId',
    parentId: null,
    replies: [],
  },
  {
    id: 2,
    content: 'second comment',
    postId: 2,
    userId: 'johnId',
    parentId: null,
    replies: [],
  },
  {
    id: 3,
    content: 'third comment',
    postId: 3,
    userId: 'aliceId',
    parentId: null,
    replies: [],
  },
];

const testComment = mockDB[0];

const mockPrisma = {
  comment: {
    findMany: jest.fn().mockReturnValue(mockDB),
    findUnique: jest.fn(({ where }) => {
      return mockDB.find((comment) => comment.id === where.id);
    }),
    create: jest.fn(({ data }) => {
      return data;
    }),
    update: jest
      .fn()
      .mockImplementation(({ data }) => ({ ...testComment, ...data })),
    delete: jest.fn().mockReturnValue(testComment),
    count: jest.fn().mockReturnValue(mockDB.length),
  },
  vote: {
    findMany: jest.fn().mockReturnValue([{ value: 1 }]),
    findFirst: jest.fn().mockReturnValue(false),
    create: jest.fn(({ data }) => {
      return data;
    }),
  },
};

const mockUsersService = {
  getUserByUsername: jest.fn().mockReturnValue({
    id: 'first',
    username: 'alex',
    email: 'alex@example.com',
    role: Role.USER,
    password: 'pass',
  }),
};

const mockPostsService = {
  getPostById: jest.fn().mockReturnValue({
    id: 1,
    title: 'first post',
    content: 'first post content',
    authorId: 'alexId',
  }),
};

describe('CommentsService', () => {
  let service: CommentsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: UsersService, useValue: mockUsersService },
        { provide: PostsService, useValue: mockPostsService },
      ],
      imports: [PrismaModule, UsersModule, PostsModule],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get all post comments with pagination', async () => {
    const result = await service.getAllPostComments(1, { page: 1, limit: 10 });
    expect(result.data).toEqual(mockDB);
    expect(result.total).toBe(mockDB.length);
    expect(mockPrisma.comment.findMany).toHaveBeenCalled();
  });

  it('should get all user comments with pagination', async () => {
    const result = await service.getAllUserComments('alex', {
      page: 1,
      limit: 10,
    });
    expect(result.data).toEqual(mockDB);
    expect(result.total).toBe(mockDB.length);
    expect(mockUsersService.getUserByUsername).toHaveBeenCalledWith('alex');
    expect(mockPrisma.comment.findMany).toHaveBeenCalled();
  });

  it('should get comment by id', async () => {
    const result = await service.getCommentById(1);
    expect(result).toEqual(mockDB[0]);
    expect(mockPrisma.comment.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('should create a new comment', async () => {
    const result = await service.createComment('Test content', 1, 'alex');
    expect(result).toEqual({
      content: 'Test content',
      postId: 1,
      authorId: 'first',
      parentId: null,
    });
    expect(mockUsersService.getUserByUsername).toHaveBeenCalledWith('alex');
    expect(mockPostsService.getPostById).toHaveBeenCalledWith(1);
    expect(mockPrisma.comment.create).toHaveBeenCalled();
  });

  it('should update a comment', async () => {
    const result = await service.updateComment(1, 'Updated content');
    expect(result.content).toBe('Updated content');
    expect(mockPrisma.comment.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { content: 'Updated content' },
    });
  });

  it('should delete a comment', async () => {
    const result = await service.deleteComment(1);
    expect(result).toBe('comment deleted successfully');
    expect(mockPrisma.comment.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('should vote on a comment when no existing vote', async () => {
    const result = await service.voteComment(1, 'alex', 1);
    expect(result.rating).toBe(1);
    expect(result.message).toBe('Vote added');
    expect(mockPrisma.vote.create).toHaveBeenCalled();
  });

  it('should throw an error if user not found when getting comments', async () => {
    mockUsersService.getUserByUsername.mockReturnValueOnce(null);

    await expect(
      service.getAllUserComments('invalid_user', { page: 1, limit: 10 }),
    ).rejects.toThrow('User not found');
  });

  it('should throw an error if no comments found for user', async () => {
    mockPrisma.comment.findMany.mockReturnValueOnce(null);

    await expect(
      service.getAllUserComments('alex', { page: 1, limit: 10 }),
    ).rejects.toThrow('Comments not found for user');
  });

  it('should throw an error if comment not found by id', async () => {
    mockPrisma.comment.findUnique.mockReturnValueOnce(undefined);

    await expect(service.getCommentById(999)).rejects.toThrow(
      'Comment not found',
    );
  });

  it('should throw an error if user not found when creating comment', async () => {
    mockUsersService.getUserByUsername.mockReturnValueOnce(null);

    await expect(
      service.createComment('content', 1, 'unknown_user'),
    ).rejects.toThrow('User not found');
  });

  it('should throw an error if post not found when creating comment', async () => {
    mockPostsService.getPostById.mockReturnValueOnce(null);

    await expect(service.createComment('content', 999, 'alex')).rejects.toThrow(
      'Post not found',
    );
  });

  it('should throw an error if comment not found during update', async () => {
    mockPrisma.comment.update.mockImplementationOnce(() => {
      throw new Error('Comment not found');
    });

    await expect(service.updateComment(999, 'updated')).rejects.toThrow(
      'Comment not found',
    );
  });

  it('should throw an error if comment not found during delete', async () => {
    mockPrisma.comment.delete.mockImplementationOnce(() => {
      throw new Error('Comment not found');
    });

    await expect(service.deleteComment(999)).rejects.toThrow(
      'Comment not found',
    );
  });
});
