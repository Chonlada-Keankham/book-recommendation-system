import { Injectable } from '@nestjs/common';
import { SignInAuthDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  create(signInAuthDto: SignInAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

}
