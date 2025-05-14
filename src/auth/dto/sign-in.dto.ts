import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';

export default class SignInDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  password: string;
}
