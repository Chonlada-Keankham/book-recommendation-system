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

    console.log('User found in database:', user);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Input password:', password);
    console.log('Hashed password from DB:', user.password);
    console.log('Is password valid:', isPasswordValid);

    if (!isPasswordValid) {
        console.log('Password mismatch for user:', user.email);
        throw new UnauthorizedException('Invalid credentials');
    }

    return user;
}

  async login(email: string, password: string): Promise<{ access_token: string }> {
    console.log('Login attempt with email:', email);
    const user = await this.validateUser(email, password);

    const payload = { email: user.email, sub: user._id, role: user.role };
    console.log('Payload for JWT:', payload);

    const accessToken = this.jwtService.sign(payload);
    return { access_token: accessToken };
  }
}