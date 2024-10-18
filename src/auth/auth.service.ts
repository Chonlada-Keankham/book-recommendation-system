import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './../user/user.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { iUser } from 'src/user/interface/user.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) { }

  async validateUser(loginAuthDto: LoginAuthDto): Promise<iUser> {
    const { email, password } = loginAuthDto;

    // Find user by email
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      console.error("User not found with email:", email);
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log("Password from request:", password);
    console.log("Password from database:", user.password);

    // Compare password using bcrypt
    const isPasswordMatching = await bcrypt.compare(password, user.password);
    console.log("Password match result:", isPasswordMatching);

    if (!isPasswordMatching) {
      console.error("Invalid password for user:", email);
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
  async login(user: iUser): Promise<{ access_token: string }> {
    const payload = { email: user.email, sub: user._id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    return { access_token: accessToken };
  }
}
