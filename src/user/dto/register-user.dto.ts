import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, Length } from 'class-validator';

export class RegisterUserDto {
  
  @IsNotEmpty({ message: 'First name is required.' })
  @IsString()
  @Transform(({ value }) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase())
  first_name: string;

  @IsNotEmpty({ message: 'Last name is required.' })
  @IsString()
  @Transform(({ value }) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase())
  last_name: string;

  @IsNotEmpty({ message: 'Phone number is required.' })
  @IsString()
  @Length(10, 10, { message: 'Phone number must be exactly 10 digits long.' })
  @Matches(/^\d{10}$/, { message: 'Phone number must consist of digits only.' })
  phone: string;

  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, { message: 'Invalid email format.' })
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsNotEmpty({ message: 'Password is required.' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @Matches(/(?=.*\d)/, { message: 'Password must contain at least one number.' })
  @Matches(/(?=.*[a-z])/, { message: 'Password must contain at least one lowercase letter.' })
  @Matches(/(?=.*[A-Z])/, { message: 'Password must contain at least one uppercase letter.' })
  @Matches(/(?=.*[!@#$%^&*])/, { message: 'Password must contain at least one special character.' })
  password: string;
  
  @IsNotEmpty({ message: 'Username is required.' })
  @IsString()
  @Length(3, 20, { message: 'Username must be between 3 and 20 characters long.' })
  username: string;
}
