import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './../user/user.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { iUser } from 'src/user/interface/user.interface';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from './dto/refresh-token-auth.dto';
import * as jwt from 'jsonwebtoken';
import { RequestPasswordResetDto } from './dto/request-pass-auth.dto';
import { ResetPasswordDto } from './dto/reset-pass-auth.dto';
import { Status } from 'src/enum/status.enum';

@Injectable()
export class AuthService {

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) { }

  async validateUser(loginAuthDto: LoginAuthDto): Promise<iUser> {
    const { email, password } = loginAuthDto;
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async login(user: iUser): Promise<{ access_token: string; refresh_token: string }> {
    const payload = { email: user.email, sub: user._id, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign({ sub: user._id }, { expiresIn: '7d' });
    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async refreshAccessToken(refreshTokenDto: RefreshTokenDto): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refresh_token);

      const user = await this.userService.findOneById(payload.sub);
      if (!user || user.status === Status.DELETED) {
        throw new UnauthorizedException('User not found or is deleted');
      }

      const newAccessToken = this.jwtService.sign(
        {
          email: user.email,
          sub: user._id,
          role: user.role,
        },
        { expiresIn: '1h' },
      );

      return {
        access_token: newAccessToken,
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }
      throw new UnauthorizedException('Token verification failed');
    }
  }

  async sendPasswordResetLink(requestPasswordResetDto: RequestPasswordResetDto) {
    const { email } = requestPasswordResetDto;

    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User with this email not found');
    }

    const resetToken = this.jwtService.sign({ email }, { expiresIn: '12h' });

    const resetLink = resetToken

    return {
      message: 'Password reset link generated successfully',
      resetLink,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    try {
      // ตรวจสอบ token ว่ายังไม่หมดอายุและถูกต้อง
      const decoded = this.jwtService.verify(token);  // token ที่ส่งมา
      console.log(decoded); // ดูข้อมูลที่ถูก decode ออกมา

      const user = await this.userService.findOneByEmail(decoded.email);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // ทำการเปลี่ยนรหัสผ่านใหม่
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.userService.updatePassword(user._id, hashedPassword);

      // สร้าง Access Token ใหม่และส่งให้ผู้ใช้
      const newAccessToken = this.jwtService.sign({ email: user.email, sub: user._id, role: user.role }, { expiresIn: '1h' });

      return {
        message: 'Password reset successful',
        access_token: newAccessToken // ส่ง Access Token ใหม่กลับไป
      };

    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new BadRequestException('Token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new BadRequestException('Invalid token');
      }
      throw new BadRequestException(error.message || 'An error occurred during password reset');
    }
  }
}
