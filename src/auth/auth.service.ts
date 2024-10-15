import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignInAuthDto } from './dto/create-auth.dto';
import { iUser } from 'src/user/interface/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<iUser>, 
    private readonly jwtService: JwtService,
  ) {}

  async signIn(signInAuthDto: SignInAuthDto) {
    const { email, password } = signInAuthDto;

    const user = await this.userModel.findOne({ email }).exec();  
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { userId: user._id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
    };
  }
}
