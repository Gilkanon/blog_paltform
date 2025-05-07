import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export default class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  username: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(50)
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  password: string;
}
