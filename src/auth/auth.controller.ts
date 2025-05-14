import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import SignInDto from './dto/sign-in.dto';
import SignUpDto from './dto/sign-up.dto';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import TokenDto from './dto/token.dto';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @ApiCreatedResponse({
    description: 'Sign in',
    type: TokenDto,
  })
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('/register')
  @ApiCreatedResponse({ description: 'Sign up', type: TokenDto })
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

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
}
