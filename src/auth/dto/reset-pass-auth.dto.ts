import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
export class ResetPasswordDto {
    @IsNotEmpty({ message: 'Token is required.' })
    @IsString({ message: 'Token must be a string.' })
    token: string;

    @IsNotEmpty({ message: 'Password is required.' })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long.' })
    @Matches(/(?=.*\d)/, { message: 'Password must contain at least one number.' })
    @Matches(/(?=.*[a-z])/, { message: 'Password must contain at least one lowercase letter.' })
    @Matches(/(?=.*[A-Z])/, { message: 'Password must contain at least one uppercase letter.' })
    @Matches(/(?=.*[!@#$%^&*])/, { message: 'Password must contain at least one special character.' })
    @Transform(({ value }) => value?.trim())
    newPassword: string;
}
