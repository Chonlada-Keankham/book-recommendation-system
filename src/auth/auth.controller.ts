import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, Body, Controller, Get, HttpStatus, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { RefreshTokenDto } from './dto/refresh-token-auth.dto';
import { RequestPasswordResetDto } from './dto/request-pass-auth.dto';
import { ResetPasswordDto } from './dto/reset-pass-auth.dto';
import { ApiTags } from '@nestjs/swagger';
import * as jwt from 'jsonwebtoken';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

  ) { }

  @Post('/login')
  async login(@Body() loginAuthDto: LoginAuthDto) {
    try {
      const user = await this.authService.validateUser(loginAuthDto);
      const tokens = await this.authService.login(user);
      return {
        statusCode: HttpStatus.OK,
        message: 'Login successful',
        data: tokens,
      };
    } catch (error) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized',
      });
    }
  }

  @Post('/refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    try {
      const tokens = await this.authService.refreshAccessToken(refreshTokenDto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Access token refreshed successfully',
        data: tokens,
      };
    } catch (error) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Invalid or expired refresh token',
        error: 'Unauthorized',
      });
    }
  }

  @Get('/profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() request): Promise<any> {
    return {
      statusCode: HttpStatus.OK,
      message: 'User profile fetched successfully',
      data: request.user,
    };
  }

  @Post('/forgot-password')
  async forgotPassword(@Body() requestPasswordResetDto: RequestPasswordResetDto) {
    const response = await this.authService.sendPasswordResetLink(requestPasswordResetDto);

    return {
      statusCode: HttpStatus.OK,
      message: response.message,
      resetLink: response.resetLink,
    };
  }

  @Post('/reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    if (!token) {
      throw new BadRequestException('Token must be provided');
    }

    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      console.log('Decoded Token:', decoded);

      const user = await this.userService.findOneById(decoded.userId);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      await this.userService.updatePassword(user._id, newPassword);

      return {
        statusCode: HttpStatus.OK,
        message: 'Password reset successful',
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.log('Token expired');
        throw new BadRequestException('Token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        console.log('Invalid token');
        throw new BadRequestException('Invalid token');
      }
      console.error('Error during password reset:', error);
      throw new BadRequestException(error.message || 'An error occurred during password reset');
    }
  }
}


