import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAdminDto {
    @IsNotEmpty({ message: 'First name is required.' })
    @IsString()
    @Matches(/^[a-zA-Zก-๙]+$/, { message: 'First name must be in Thai or English letters only.' })
    @Transform(({ value }) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase())
    first_name: string;

    @IsNotEmpty({ message: 'Last name is required.' })
    @IsString()
    @Matches(/^[a-zA-Zก-๙]+$/, { message: 'Last name must be in Thai or English letters only.' })
    @Transform(({ value }) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase())
    last_name: string;

    @IsNotEmpty({ message: 'Email is required.' })
    @IsEmail({}, { message: 'Invalid email format.' })
    @Transform(({ value }) => value.toLowerCase())
    email: string;

    @IsOptional()
    @Matches(/^0\d{9}$/, { message: 'Phone number must be a valid 10-digit Thai number' })
    @IsString()
    phone?: string;
    
    @IsOptional()
    @IsString()
    username?: string;

}
