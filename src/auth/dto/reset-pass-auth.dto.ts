import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
export class ResetPasswordDto {
    @IsNotEmpty({ message: 'Token is required.' })
    @IsString({ message: 'Token must be a string.' })
    token: string;
  
    @IsNotEmpty({ message: 'New password is required.' })
    @IsString({ message: 'New password must be a string.' })
    @MinLength(8, { message: 'New password must be at least 8 characters long.' })
    @Matches(/(?=.*\d)/, { message: 'New password must contain at least one number.' })
    @Matches(/(?=.*[a-z])/, { message: 'New password must contain at least one lowercase letter.' })
    @Matches(/(?=.*[A-Z])/, { message: 'New password must contain at least one uppercase letter.' })
    @Matches(/(?=.*[!@#$%^&*])/, { message: 'New password must contain at least one special character.' })
    @Transform(({ value }) => value?.trim())
    newPassword: string;  }
  