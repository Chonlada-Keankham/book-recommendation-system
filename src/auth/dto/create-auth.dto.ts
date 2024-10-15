import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInAuthDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
