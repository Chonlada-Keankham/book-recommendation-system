import { JwtService } from '@nestjs/jwt';
import { UserService } from './../user/user.service';
import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { iUser } from 'src/user/interface/user.interface';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<iUser> {
    // ค้นหาผู้ใช้โดยอีเมล
    const user = await this.userService.findOneByEmail(email);
    console.log('User found:', user); 

    if (!user) {
      console.log('User not found with email:', email);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      console.log('No password found for user:', user.email);
      throw new InternalServerErrorException('Password not found for user.');
    }

    // แสดงข้อมูลรหัสผ่านที่ป้อนและแฮช
    console.log('Input password:', password);
    console.log('Hashed password from DB:', user.password);
    
    // ตรวจสอบความถูกต้องของรหัสผ่าน
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Is password valid:', isPasswordValid);

    // หากรหัสผ่านไม่ถูกต้องให้แสดงข้อความที่เกี่ยวข้อง
    if (!isPasswordValid) {
      console.log('Password mismatch for user:', user.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    // หากเข้าสู่ระบบสำเร็จ
    return user; 
  }

  async login(user: iUser) {
    const payload = { sub: user._id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
