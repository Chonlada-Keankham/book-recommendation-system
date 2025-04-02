import { PartialType } from '@nestjs/mapped-types';
import { RegisterUserDto } from './register-member-user.dto';

export class UpdateUserDto extends PartialType(RegisterUserDto) {
}
