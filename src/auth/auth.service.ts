import { JwtService } from '@nestjs/jwt';
import { UserService } from './../user/user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { iUser } from 'src/user/interface/user.interface';
import bcrypt from 'bcryptjs';


@Injectable()
export class AuthService {

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      return user; 
    }
    throw new UnauthorizedException('Invalid credentials'); 
  }
  
  async login(user: iUser) {
    const payload = { sub: user._id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUserById(id: string) {
    return this.userService.findOneById(id); 
  }
}
