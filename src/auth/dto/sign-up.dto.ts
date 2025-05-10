import { IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';

export default class SignUpDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  password: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  confirmPassword: string;
}
