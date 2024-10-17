import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './../user/user.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { iUser } from 'src/user/interface/user.interface';
import { hashPassword, comparePassword } from 'src/utils/hash.util'; // นำเข้า comparePassword

@Injectable()
export class AuthService {

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly SALT_ROUNDS: number
  ) { 
    this.SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;
  }

  async hashPassword(password: string): Promise<string> {
    return await hashPassword(password, this.SALT_ROUNDS); // ส่ง SALT_ROUNDS
  }
  
  async validateUser(loginAuthDto: LoginAuthDto): Promise<iUser> {
    const { email, password } = loginAuthDto; 
    const user = await this.userService.findOneByEmail(email);
    console.log("User found in database:", user);

    if (!user) {
        throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await comparePassword(password, user.password); // ใช้ comparePassword
    console.log("Password valid:", isPasswordValid);

    if (!isPasswordValid) {
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
