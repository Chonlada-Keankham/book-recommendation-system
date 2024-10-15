import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel('User') private readonly userModel: Model<iUser>,
    private readonly jwtService: JwtService,

  ) {}

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

}
