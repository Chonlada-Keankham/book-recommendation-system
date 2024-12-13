import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './../user/user.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { iUser } from 'src/user/interface/user.interface';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto/change-pass-auth.dto';
import { ForgotPasswordDto } from './dto/forgot-pass-auth.dto';
import { ResetPasswordDto } from './dto/reset-pass-auth.dto';

@Injectable()
export class AuthService {

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    
  ) { }

  async validateUser(loginAuthDto: LoginAuthDto): Promise<iUser> {
    const { email, password } = loginAuthDto;

    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      console.error("User not found with email:", email);
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log("Password from request:", password);
    console.log("Password from database:", user.password);

    const isPasswordMatching = await bcrypt.compare(password, user.password);
    console.log("Password match result:", isPasswordMatching);

    if (!isPasswordMatching) {
      console.error("Invalid password for user:", email);
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(user: iUser): Promise<{ access_token: string; refresh_token: string }> {
    const payload = { email: user.email, sub: user._id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign({ sub: user._id }, { expiresIn: '7d' });
    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ access_token: string }> {
    const payload = this.jwtService.verify(refreshToken);
    const user = await this.userService.findOneById(payload.sub);
    return this.login(user);
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<string> {
    const user = await this.userService.findOneById(userId);
    if (!user) throw new NotFoundException('User not found');

    const isPasswordValid = await bcrypt.compare(changePasswordDto.oldPassword, user.password);
    if (!isPasswordValid) throw new BadRequestException('Invalid old password');

    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    const updateUserDto = { password: hashedNewPassword };

    await this.userService.updateOne(userId, updateUserDto);
    return 'Password successfully updated';
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<string> {
    const user = await this.userService.findOneByEmail(forgotPasswordDto.email);
    if (!user) throw new NotFoundException('User not found');

    const token = this.jwtService.sign({ userId: user._id }, { expiresIn: '15m' });

    await this.sendResetPasswordEmail(user.email, token);

    return 'Password reset token generated and sent via email';
  }

  private async sendResetPasswordEmail(email: string, token: string): Promise<void> {
    console.log(`Password reset email sent to ${email} with token: ${token}`);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<string> {
    try {
      const payload = await this.jwtService.verifyAsync(resetPasswordDto.token);
      const user = await this.userService.findOneById(payload.userId);
      if (!user) throw new NotFoundException('User not found');

      user.password = await bcrypt.hash(resetPasswordDto.newPassword, 10);
      await this.userService.createOne(user);
      return 'Password successfully reset';
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }
  }

}
