import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import SignInDto from './dto/sign-in.dto';
import SignUpDto from './dto/sign-up.dto';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import TokenDto from './dto/token.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';
import { GoogleOAuthGuard } from './guards/google.guard';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/login')
  @ApiCreatedResponse({
    description: 'Sign in',
    type: TokenDto,
  })
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Public()
  @Post('/register')
  @ApiCreatedResponse({ description: 'Sign up', type: TokenDto })
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Public()
  @Post('/refresh')
  @ApiCreatedResponse({ description: 'Refresh token' })
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('/logout')
  @ApiOkResponse({ description: 'Logout' })
  async logout(@Body('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }

  @Public()
  @Get('/google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(@Req() req) {}

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthRedirect(@Req() req) {
    return req.user;
  }
}
