import { JwtService } from '@nestjs/jwt';
import { UserService } from './../user/user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { iUser } from 'src/user/interface/user.interface';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string): Promise<iUser> {
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      console.log('User not found with email:', email);
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('User found:', user);
    console.log('Input password:', password);
    console.log('Hashed password from DB:', user.password);

    const isPasswordValid = await bcrypt.compare(password, user.password);

    console.log('Is password valid:', isPasswordValid);
    if (!isPasswordValid) {
      console.log('Password mismatch for user:', user.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }



}