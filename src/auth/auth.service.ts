import { LoginEmployeeDto } from './dto/login-employee-auth.dto';
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './../user/user.service';
import { iUser } from 'src/user/interface/user.interface';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from './dto/refresh-token-auth.dto';
import * as jwt from 'jsonwebtoken';
import { RequestPasswordResetDto } from './dto/request-pass-auth.dto';
import { ResetPasswordDto } from './dto/reset-pass-auth.dto';
import { Status } from 'src/enum/status.enum';
import { UserRole } from 'src/enum/user-role.enum';
import { LoginMemberDto } from './dto/login-member-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) { }

  // -------------------------------------------------------------------
  // 🔸 VALIDATION
  // -------------------------------------------------------------------

  async validateMember(loginMemberDto: LoginMemberDto): Promise<iUser> {
    const { email, password } = loginMemberDto;
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

  async validateEmployee(loginEmployeeDto: LoginEmployeeDto): Promise<iUser> {
    const { employeeId, password } = loginEmployeeDto;
    const user = await this.userService.findByEmployeeId(employeeId);

    if (!user || user.role !== UserRole.EMPLOYEE) {
      throw new UnauthorizedException('Invalid employeeId or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid employeeId or password');
    }

    return user;
  }

  // -------------------------------------------------------------------
  // 🔸 LOGIN / REFRESH TOKEN
  // -------------------------------------------------------------------

  async login(user: iUser): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const payload = {
      email: user.email,
      sub: user._id,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign({ sub: user._id }, { expiresIn: '7d' });
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshAccessToken(refreshTokenDto: RefreshTokenDto): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refresh_token);
      const user = await this.userService.findOneById(payload.sub);
      if (!user || user.status === Status.DELETED) {
        throw new UnauthorizedException('User not found or is deleted');
      }
      const newAccessToken = this.jwtService.sign(
        { email: user.email, sub: user._id, role: user.role },
        { expiresIn: '1h' },
      );
      return { access_token: newAccessToken };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }
      throw new UnauthorizedException('Token verification failed');
    }
  }

  // -------------------------------------------------------------------
  // 🔸 PASSWORD RESET
  // -------------------------------------------------------------------

  async sendPasswordResetLink(requestPasswordResetDto: RequestPasswordResetDto) {
    const { email } = requestPasswordResetDto;
    
    const user = await this.userService.findOneByEmail(email);   // << ที่นี่เลย
  
    if (!user) {
      throw new NotFoundException('User with this email not found');
    }
  
    // ➡️ ใส่เพิ่มตรงนี้
    if (user.role !== 'member') {
      throw new UnauthorizedException('Only members can reset password');
    }
  
    const payload = { email: user.email, sub: user._id.toString() };
    const resetToken = this.jwtService.sign(payload, { expiresIn: '1h' });
  
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const resetLink = `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
  
    return {
      message: 'Password reset link generated successfully',
      resetToken,
      resetLink,
    };
  }
  
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const user = await this.userService.findOneByEmail(decoded.email);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.userService.updatePassword(user._id, hashedPassword);

      return { message: 'Password reset successful' };
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
