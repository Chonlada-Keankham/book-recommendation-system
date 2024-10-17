import { IsEmail, IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class LoginAuthDto {
  @IsEmail({}, { message: 'Invalid email format' }) 
  @IsNotEmpty({ message: 'Email is required' }) 
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' }) 
  @MinLength(8, { message: 'Password must be at least 8 characters long' }) 
  @Matches(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  }) 
  password: string;
}
