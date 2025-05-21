import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export default class CreatePostDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(1, 1000)
  content: string;
}
