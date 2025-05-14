import { ApiProperty } from '@nestjs/swagger';

export default class TokenDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}
