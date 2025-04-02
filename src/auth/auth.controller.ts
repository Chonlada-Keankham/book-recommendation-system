import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { Body, Controller, Get, HttpStatus, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { RefreshTokenDto } from './dto/refresh-token-auth.dto';
import { RequestPasswordResetDto } from './dto/request-pass-auth.dto';
import { ResetPasswordDto } from './dto/reset-pass-auth.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from 'src/enum/user-role.enum';

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
  @ApiOperation({ summary: 'Member login only' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Member login successful'
  })
  async login(@Body() loginAuthDto: LoginAuthDto) {
    try {
      const user = await this.authService.validateUser(loginAuthDto);

      if (user.role !== UserRole.MEMBER) {
        throw new UnauthorizedException({
          statusCode: 401,
          message: 'Only members can login here',
          error: 'Unauthorized',
        });
      }

      const tokens = await this.authService.login(user);
      return {
        statusCode: HttpStatus.OK,
        message: 'Member login successful',
        data: tokens,
      };
    } catch (error) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: error.message || 'Invalid credentials',
        error: 'Unauthorized',
      });
    }
  }

  @Post('/login-employee')
  @ApiOperation({ summary: 'Employee login only' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Employee login successful' })
  async loginEmployee(@Body() body: { employeeId: string; password: string }) {
    try {
      const user = await this.authService.validateEmployee(body.employeeId, body.password);
      const tokens = await this.authService.login(user);
      return {
        statusCode: HttpStatus.OK,
        message: 'Employee login successful',
        data: tokens,
      };
    } catch (error) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: error.message || 'Invalid credentials',
        error: 'Unauthorized',
      });
    }
  }

  @Post('/refresh')
  @ApiOperation({ summary: 'Refresh token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Access token refreshed successfully'
  })
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
  @ApiOperation({ summary: 'Get user profile (JWT Required)' })
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() request) {
    return {
      statusCode: HttpStatus.OK,
      message: 'User profile fetched successfully',
      data: request.user,
    };
  }

  @Post('/send-password-reset-link')
  @ApiOperation({ summary: 'Send password reset link to email' })
  async sendPasswordResetLink(@Body() dto: RequestPasswordResetDto) {
    const response = await this.authService.sendPasswordResetLink(dto);
    return {
      statusCode: HttpStatus.OK,
      message: response.message,
      resetLink: response.resetLink,
      token: response,
    };
  }

  @Post('/reset-password')
  @ApiOperation({ summary: 'Reset password' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const response = await this.authService.resetPassword(dto);
    return {
      statusCode: HttpStatus.OK,
      message: response.message,
    };
  }
}
