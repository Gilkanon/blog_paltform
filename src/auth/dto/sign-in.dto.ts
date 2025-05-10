import { IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';

export default class SignInDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  username: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  password: string;
}
