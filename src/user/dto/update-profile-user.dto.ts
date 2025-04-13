import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MinLength, Matches, Length } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Zก-๙]+$/, { message: 'First name can only contain letters (Thai or English).' })
  @Transform(({ value }) => value?.charAt(0).toUpperCase() + value?.slice(1).toLowerCase())
  first_name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Zก-๙]+$/, { message: 'Last name can only contain letters (Thai or English).' })
  @Transform(({ value }) => value?.charAt(0).toUpperCase() + value?.slice(1).toLowerCase())
  last_name?: string;

  @IsOptional()
  @IsString()
  @Length(10, 10, { message: 'Phone number must be exactly 10 digits long.' })
  @Matches(/^(0\d{9})$/, { message: 'Phone number must be a valid Thai mobile number.' })
  phone?: string;

  @IsOptional()
  @IsString()
  @Length(3, 20, { message: 'Username must be between 3 and 20 characters long.' })
  @Transform(({ value }) => value?.trim())
  username?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  profileImage?: any; // ✅ เอาแค่รูปโปรไฟล์

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @Matches(/(?=.*\d)/, { message: 'Password must contain at least one number.' })
  @Matches(/(?=.*[a-z])/, { message: 'Password must contain at least one lowercase letter.' })
  @Matches(/(?=.*[A-Z])/, { message: 'Password must contain at least one uppercase letter.' })
  @Matches(/(?=.*[!@#$%^&*])/, { message: 'Password must contain at least one special character.' })
  @Transform(({ value }) => value?.trim())
  password?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  confirmPassword?: string;
}
