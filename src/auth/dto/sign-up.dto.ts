import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';

export default class SignUpDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  confirmPassword: string;
}
