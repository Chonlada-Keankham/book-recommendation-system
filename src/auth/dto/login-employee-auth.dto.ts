import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginEmployeeDto {
    @IsNotEmpty({ message: 'Employee ID is required.' })
    @IsString()
    @Transform(({ value }) => value.toLowerCase())
    employeeId: string;

    @IsNotEmpty({ message: 'Password is required.' })
    @IsString()
    password: string;
}
