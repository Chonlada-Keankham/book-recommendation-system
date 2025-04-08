import { IsNotEmpty, IsString } from 'class-validator';

export class LoginEmployeeDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
