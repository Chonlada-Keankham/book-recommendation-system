import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { Body, Controller, Get, HttpStatus, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { RefreshTokenDto } from './dto/refresh-token-auth.dto';
import { RequestPasswordResetDto } from './dto/request-pass-auth.dto';
import { ResetPasswordDto } from './dto/reset-pass-auth.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from 'src/enum/user-role.enum';
import { LoginMemberDto } from './dto/login-member-auth.dto';
import { LoginEmployeeDto } from './dto/login-employee-auth.dto';
import { RolesGuard } from './guard/role.guard';
import { Roles } from 'src/decorator/roles.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  // ---------------------- LOGIN ----------------------
  @Post('/login-member')
  @ApiOperation({ summary: 'Member login only' })
  async loginMember(@Body() loginMemberDto: LoginMemberDto) {
    const user = await this.authService.validateMember(loginMemberDto);
  
    if (user.role !== UserRole.MEMBER) {
      throw new UnauthorizedException('Only members can login here');
    }
  
    const tokens = await this.authService.login(user);
  
    return {
      statusCode: HttpStatus.OK,
      message: 'Member login successful',
      data: {
        id: user._id,   
        ...tokens,     
      },
    };
  }
  
  @Post('/login-employee')
  @ApiOperation({ summary: 'Employee login only' })
  async loginEmployee(@Body() loginEmployeeDto: LoginEmployeeDto) {
    const user = await this.authService.validateEmployee(loginEmployeeDto);
    const tokens = await this.authService.login(user);
    return {
      statusCode: HttpStatus.OK,
      message: 'Employee login successful',
      data: tokens,
    };
  }

  // ---------------------- REFRESH TOKEN ----------------------
  @Post('/refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    const tokens = await this.authService.refreshAccessToken(refreshTokenDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Access token refreshed successfully',
      data: tokens,
    };
  }

  // ---------------------- PROFILE ----------------------
  @Get('/profile')
  @ApiOperation({ summary: 'Get user profile (JWT Required)' })
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() request) {
    const { password, ...userWithoutPassword } = request.user;  
    return {
      statusCode: HttpStatus.OK,
      message: 'User profile fetched successfully',
      data: userWithoutPassword,
    };
  }

  // ---------------------- ROLE-BASED ACCESS ----------------------
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  @Get('/employee-only')
  @ApiOperation({ summary: 'Employee only route' })
  async getForEmployee() {
    return {
      statusCode: HttpStatus.OK,
      message: 'Hello Employee',
    };
  }

  // ---------------------- PASSWORD RESET ----------------------
  @Post('/send-password-reset-link')
  @ApiOperation({ summary: 'Send password reset link to email' })
  async sendPasswordResetLink(@Body() dto: RequestPasswordResetDto) {
    const response = await this.authService.sendPasswordResetLink(dto);
    return {
      statusCode: HttpStatus.OK,
      message: response.message,
      resetLink: response.resetLink,
      token: response.resetToken,
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

  async logout(userId: string): Promise<void> {
    await this.userService.updateUserRefreshToken(userId, null);  
  }
  
}
