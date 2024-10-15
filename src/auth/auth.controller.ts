import { Body, Controller, HttpStatus, Post, UseGuards, Res, HttpException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { LoginDto } from './dto/create-auth.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      const user = await this.authService.validateUser(loginDto.email, loginDto.password);
      
      const token = await this.authService.login(user);

      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Login successful',
        data: { user, token },
      });
    } catch (error) {
      // ตรวจสอบประเภทของข้อผิดพลาด
      if (error instanceof UnauthorizedException) {
        console.log('Unauthorized login attempt:', error.message); // แสดงข้อมูลใน Console
        return res.status(HttpStatus.UNAUTHORIZED).json({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Invalid credentials',
        });
      }

      // ข้อผิดพลาดอื่น ๆ
      console.error('Login error:', error); // แสดงข้อผิดพลาดใน Console
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
