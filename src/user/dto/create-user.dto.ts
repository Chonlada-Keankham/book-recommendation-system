import { IsEmail, IsEnum, IsNotEmpty, IsPhoneNumber, IsString, MinLength } from 'class-validator';
import { UserRole } from 'src/enum/user-role.enum';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsNotEmpty()
  @IsPhoneNumber(null)
  phone: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}
