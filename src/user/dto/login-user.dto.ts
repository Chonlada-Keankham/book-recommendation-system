import { IsEmail,IsNotEmpty,IsString, MinLength, Matches } from 'class-validator';

export class LoginUserDto {
@IsNotEmpty()
@IsEmail()
email: string;

@IsNotEmpty()
@IsString()
@MinLength(6, { message: 'Password must be at least 6 characters long' })
@Matches(/(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/, { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.' })
password: string;

}
