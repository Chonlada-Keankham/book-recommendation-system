import { HttpStatus, Injectable, NotFoundException, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './../user/user.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { iUser } from 'src/user/interface/user.interface';
import * as bcrypt from 'bcrypt';
import { ForgotPasswordDto } from './dto/forgot-pass-auth.dto';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail/mail.service';
import { ResetPasswordDto } from './dto/reset-pass-auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {

  constructor(
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) { }

  async validateUser(loginAuthDto: LoginAuthDto): Promise<iUser> {
    const { email, password } = loginAuthDto;

    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      console.error("User not found with email:", email);
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        error: 'Unauthorized',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!isPasswordMatching) {
      console.error("Invalid password for user:", email);
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        error: 'Unauthorized',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
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
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newAccessToken = this.jwtService.sign({
        email: user.email,
        sub: user._id,
        role: user.role,
      });

      return {
        access_token: newAccessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<string> {
    const user = await this.userService.findOneByEmail(forgotPasswordDto.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = this.jwtService.sign({ userId: user._id }, { expiresIn: '15m' });
    const resetPasswordUrl = `${this.configService.get('EMAIL_RESET_PASSWORD_URL')}?token=${token}`;

    await this.mailService.sendResetPasswordLink(user.email, resetPasswordUrl);

    return 'Password reset token generated and sent via email';
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<string> {
    const { token, newPassword } = resetPasswordDto;

    const email = await this.mailService.decodeConfirmationToken(token);

    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await this.userService.updateOne(user._id, user);

    return 'Password successfully reset';
  }
}

