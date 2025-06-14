import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { Role } from '@prisma/client';

const mockDB = [
  {
    id: 1,
    title: 'first post',
    content: 'first post content',
    authorId: 'alexId',
  },
  {
    id: 2,
    title: 'second post',
    content: 'second post content',
    authorId: 'johnId',
  },
  {
    id: 3,
    title: 'third post',
    content: 'Third post content',
    authorId: 'aliceId',
  },
];

const testPost = mockDB[0];

const mockPrisma = {
  post: {
    findMany: jest.fn().mockReturnValue(mockDB),
    findUnique: jest.fn(({ where }) => {
      return mockDB.find(
        (post) => post.id === where.id || post.authorId === where.authorId,
      );
    }),
    findFirst: jest.fn().mockReturnValue(testPost),
    create: jest.fn(({ data }) => {
      return data;
    }),
    update: jest
      .fn()
      .mockImplementation(({ data }) => ({ ...testPost, ...data })),
    delete: jest.fn().mockReturnValue(testPost),
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

describe('PostsService', () => {
  let service: PostsService;
  let prisma: PrismaService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: UsersService,
          useValue: {
            getUserByUsername: jest.fn().mockReturnValue({
              id: 'first',
              username: 'alex',
              email: 'alex@example.com',
              role: Role.USER,
              password: 'pass',
            }),
          },
        },
      ],
      imports: [PrismaModule, UsersModule],
    }).compile();

    service = module.get<PostsService>(PostsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return paginated list of posts', async () => {
    const result = await service.getAllPosts({ page: 1, limit: 10 });
    expect(result.data).toHaveLength(mockDB.length);
    expect(result.total).toBe(mockDB.length);
  });

  it('should return post by id', async () => {
    const result = await service.getPostById(1);
    expect(result).toEqual(testPost);
    expect(result.id).toBe(1);
  });

  it('should return posts by author username', async () => {
    const result = await service.getPostsByUsername('alex', {
      page: 1,
      limit: 10,
    });
    expect(result.data).toHaveLength(mockDB.length);
    expect(result.total).toBe(mockDB.length);
  });

  it('should return post by author username and id', async () => {
    const result = await service.getCurrentPostByUsername('alex', 1);
    expect(result).toEqual(testPost);
  });

  it('should create a new post and return it', async () => {
    const result = await service.createPost(
      { title: 'new post', content: 'new post content' },
      'alex',
    );
    expect(result.title).toEqual('new post');
    expect(result.content).toEqual('new post content');
    expect(result.authorId).toEqual('first');
  });

  it('should update post', async () => {
    const result = await service.updatePost('alex', 1, { title: 'updated' });
    expect(result.title).toEqual('updated');
    expect(result.id).toBe(1);
  });

  it('should delete post', async () => {
    const result = await service.deletePost('alex', 1);
    expect(result).toEqual(`Post ${testPost.title} deleted`);
  });

  it('should vote on a post', async () => {
    const result = await service.voteOnPost(1, 'alex', 1);
    expect(result.message).toEqual('Vote added');
    expect(result.rating).toEqual(1);
  });
});
