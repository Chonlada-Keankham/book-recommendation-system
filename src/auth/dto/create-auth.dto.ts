import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class SignInAuthDto {
  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, { message: 'Invalid email format.' })
  email: string;

  @IsNotEmpty({ message: 'Password is required.' })
  @IsString()
  @Length(6, 20, { message: 'Password must be between 6 and 20 characters long.' })
  password: string;
}
