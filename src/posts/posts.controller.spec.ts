import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import PostDto from './dto/post.dto';
import { VoteDto } from 'src/common/dto/vote.dto';

const mockPost = {
  id: 1,
  title: 'post title',
  content: 'post content',
  authorId: 'alexId',
};

const mockPostService = {
  getAllPosts: jest.fn().mockReturnValue({ data: [mockPost], total: 1 }),
  getPostById: jest.fn().mockReturnValue(mockPost),
  getPostsByUsername: jest.fn().mockReturnValue({ data: [mockPost], total: 1 }),
  getCurrentPostByUsername: jest.fn().mockReturnValue(mockPost),
  createPost: jest.fn().mockReturnValue(mockPost),
  updatePost: jest.fn().mockReturnValue({ ...mockPost, title: 'updated' }),
  deletePost: jest.fn().mockReturnValue({ message: 'Post deleted' }),
  voteOnPost: jest.fn().mockReturnValue({ rating: 1, message: 'Vote added' }),
};

describe('PostsController', () => {
  let controller: PostsController;
  let service: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: mockPostService,
        },
      ],
      imports: [PrismaModule],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return paginated list of posts', async () => {
    const result = await controller.getAllPosts({ page: 1, limit: 10 });
    expect(result).toBeInstanceOf(PaginatedResponseDto);
    expect(result.data).toHaveLength(1);
    expect(result.total).toEqual(1);
  });

  it('should return post by id', async () => {
    const result = await controller.getPostById(1);
    expect(result).toBeInstanceOf(PostDto);
    expect(result.id).toEqual(1);
  });

  it('should return paginated list of post current user', async () => {
    const result = await controller.getPostsByUsername('alex', {
      page: 1,
      limit: 10,
    });
    expect(result).toBeInstanceOf(PaginatedResponseDto);
    expect(result.data[0].authorId).toEqual('alexId');
  });

  it('should return current post by username and postId', async () => {
    const result = await controller.getCurrentPostByUsername('alex', 1);
    expect(result).toBeInstanceOf(PostDto);
    expect(result.id).toEqual(1);
    expect(result.authorId).toBe('alexId');
  });

  it('should create a new post and return it', async () => {
    const result = await controller.createPost(
      {
        title: 'title',
        content: 'content',
      },
      'alex',
    );

    expect(result).toBeInstanceOf(PostDto);
    expect(service.createPost).toHaveBeenCalledWith(
      {
        title: 'title',
        content: 'content',
      },
      'alex',
    );
  });

  it('should update a post', async () => {
    const result = await controller.updatePost('alex', 1, { title: 'updated' });
    expect(result).toBeInstanceOf(PostDto);
    expect(result.title).toEqual('updated');
    expect(service.updatePost).toHaveBeenCalledWith('alex', 1, {
      title: 'updated',
    });
  });

  it('should delete a post', async () => {
    const result = await controller.deletePost('alex', 1);
    expect(result).toEqual({ message: 'Post deleted' });
  });

  it('should vote on a post', async () => {
    const result = await controller.votePost(1, { voteValue: 1 }, 'alex');
    expect(result).toBeInstanceOf(VoteDto);
    expect(result.rating).toEqual(1);
    expect(result.message).toEqual('Vote added');
  });
});
