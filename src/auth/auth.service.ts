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

    const resetToken = this.jwtService.sign({ email }, { expiresIn: '1h' });

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    console.log('Frontend URL:', frontendUrl); 

    if (!frontendUrl) {
      throw new Error('FRONTEND_URL is not defined in the configuration');
    }

    const resetLink = `${frontendUrl}?token=${resetToken}`;

    console.log('Frontend URL:', frontendUrl); 
    console.log('Reset Link:', resetLink);  

    return {
      message: 'Password reset link generated successfully',
      resetLink,
      token: resetToken,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    try {
      const decoded = this.jwtService.verify(token);
      console.log(decoded);
      const user = await this.userService.findOneByEmail(decoded.email);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.userService.updatePassword(user._id, hashedPassword);

      return {
        message: 'Password reset successful',
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
