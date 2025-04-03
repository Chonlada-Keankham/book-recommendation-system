import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateEmployeeDto {
    @IsNotEmpty({ message: 'First name is required.' })
    @IsString()
    @Matches(/^[a-zA-Zก-๙]+$/, { message: 'First name can only contain letters (Thai or English).' })
    @Transform(({ value }) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase())
    first_name: string;

    @IsNotEmpty({ message: 'Last name is required.' })
    @IsString()
    @Matches(/^[a-zA-Zก-๙]+$/, { message: 'Last name can only contain letters (Thai or English).' })
    @Transform(({ value }) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase())  // เพิ่มการแปลงตัวแรกของนามสกุล
    last_name: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsNotEmpty({ message: 'Email is required.' })
    @IsEmail({}, { message: 'Invalid email format.' })
    @Transform(({ value }) => value.toLowerCase())
    email: string;

    @IsOptional()
    @IsString()
    username?: string;
}
