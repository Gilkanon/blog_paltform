import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import SignInDto from './dto/sign-in.dto';
import SignUpDto from './dto/sign-up.dto';

const mockTokens = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
};

const mockAuthService = {
  signIn: jest.fn().mockReturnValue(mockTokens),
  signUp: jest.fn().mockReturnValue(mockTokens),
  refreshToken: jest.fn().mockReturnValue(mockTokens),
  logout: jest.fn().mockReturnValue(undefined),
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
      imports: [PrismaModule],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('should call authService.signIn and return tokens', async () => {
      const dto: SignInDto = {
        username: 'testuser',
        password: '123456',
      };

      const result = await controller.signIn(dto);
      expect(mockAuthService.signIn).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockTokens);
    });
  });

  describe('signUp', () => {
    it('should call authService.signUp and return tokens', async () => {
      const dto: SignUpDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123456',
        confirmPassword: '123456',
      };

      const result = await controller.signUp(dto);
      expect(mockAuthService.signUp).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockTokens);
    });
  });

  describe('refreshToken', () => {
    it('should call authService.refreshToken and return new access token', async () => {
      const refreshToken = 'mockRefreshToken';

      const result = await controller.refreshToken(refreshToken);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(refreshToken);
      expect(result).toEqual(mockTokens);
    });
  });

  describe('logout', () => {
    it('should call authService.logout and return void', async () => {
      const refreshToken = 'mockRefreshToken';

      const result = await controller.logout(refreshToken);
      expect(mockAuthService.logout).toHaveBeenCalledWith(refreshToken);
      expect(result).toBeUndefined();
    });
  });
});
