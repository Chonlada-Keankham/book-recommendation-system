import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, Matches } from "class-validator";

export class RequestPasswordResetDto {
  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, { message: 'Invalid email format.' })
  @Matches(/^[^*]+$/, { message: 'Email must not contain asterisk (*).' }) // ❌ ห้าม *
  @Transform(({ value }) => value.toLowerCase())
  email: string;
}
