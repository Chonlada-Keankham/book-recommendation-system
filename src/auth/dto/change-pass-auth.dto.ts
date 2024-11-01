import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
    @IsNotEmpty({ message: 'Old password is required.' })
    @IsString({ message: 'Old password must be a string.' })
    oldPassword: string;

    @IsNotEmpty({ message: 'New password is required.' })
    @IsString({ message: 'New password must be a string.' })
    @MinLength(8, { message: 'New password must be at least 8 characters long.' })
    @Matches(/(?=.*[0-9])/, { message: 'New password must contain at least one number.' })
    @Matches(/(?=.*[a-z])/, { message: 'New password must contain at least one lowercase letter.' })
    @Matches(/(?=.*[A-Z])/, { message: 'New password must contain at least one uppercase letter.' })
    @Matches(/(?=.*[!@#$%^&*])/, { message: 'New password must contain at least one special character.' })
    newPassword: string;
}
