import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { iUser } from 'src/user/interface/user.interface';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from './dto/refresh-token-auth.dto';
import { LoginMemberDto } from './dto/login-member-auth.dto';
import { LoginEmployeeDto } from './dto/login-employee-auth.dto';
import { RequestPasswordResetDto } from './dto/request-pass-auth.dto';
import { ResetPasswordDto } from './dto/reset-pass-auth.dto';
import { Status } from 'src/enum/status.enum';
import { UserRole } from 'src/enum/user-role.enum';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) { }

  // ---------------------- VALIDATE USER ----------------------
  async validateMember(loginMemberDto: LoginMemberDto): Promise<iUser> {
    const { email, password } = loginMemberDto;
    const user = await this.userService.findOneByEmail(email);
  
    if (!user || !user.password) {  
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
    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!user || !isPasswordMatching) {
      throw new UnauthorizedException('Invalid employeeId or password');
    }
    return user;
  }

  // ---------------------- LOGIN / REFRESH ----------------------
  async login(user: iUser): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const payload = { email: user.email, sub: user._id, role: user.role };
    const secret = this.configService.get<string>('JWT_SECRET');

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1h',
      secret,
    });

    const refreshToken = this.jwtService.sign({ sub: user._id }, {
      expiresIn: '7d',
      secret,
    });

    await this.userService.updateUserRefreshToken(user._id, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshAccessToken(refreshTokenDto: RefreshTokenDto): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refresh_token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const user = await this.userService.findOneById(payload.sub);
      if (!user || user.status === Status.DELETED) {
        throw new UnauthorizedException('User not found or is deleted');
      }

      if (user.refreshToken !== refreshTokenDto.refresh_token) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const accessToken = this.jwtService.sign(
        { email: user.email, sub: user._id, role: user.role },
        { expiresIn: '1h', secret: this.configService.get<string>('JWT_SECRET') }
      );

      return { access_token: accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // ---------------------- PASSWORD RESET ----------------------
  async sendPasswordResetLink(requestPasswordResetDto: RequestPasswordResetDto) {
    const { email } = requestPasswordResetDto;
    const user = await this.userService.findOneByEmail(email);
    if (!user || user.role !== UserRole.MEMBER) {
      throw new UnauthorizedException('Only members can reset password');
    }

    const resetToken = this.jwtService.sign(
      { email: user.email, sub: user._id.toString() },
      { expiresIn: '1h', secret: this.configService.get<string>('JWT_SECRET') }
    );

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
      throw new BadRequestException('Invalid or expired token');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.userService.updateUserRefreshToken(userId, null);

  }
}
