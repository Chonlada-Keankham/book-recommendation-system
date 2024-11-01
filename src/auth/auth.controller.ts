import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-pass-auth.dto';
import { ResetPasswordDto } from './dto/reset-pass-auth.dto';
import { ChangePasswordDto } from './dto/change-pass-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body() loginAuthDto: LoginAuthDto) {
    const user = await this.authService.validateUser(loginAuthDto);
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password/:userId')
  async changePassword(@Param('userId') userId: string, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(userId, changePasswordDto);
  }
    
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
  
  @Post('refresh') 
  @UseGuards(JwtAuthGuard) 
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshAccessToken(refreshTokenDto.refresh_token);
  }


}

