import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body() loginAuthDto: LoginAuthDto) {
      const user = await this.authService.validateUser(loginAuthDto); // เปลี่ยนแค่บรรทัดนี้
      return this.authService.login(user);
  }
  

}
