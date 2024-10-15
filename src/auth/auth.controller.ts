import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInAuthDto } from './dto/create-auth.dto';

@Controller('auth') 
export class AuthController {
  
  constructor(private readonly authService: AuthService) {}

  @Post('login') 
  async login(@Body() signInAuthDto: SignInAuthDto) {
    return this.authService.signIn(signInAuthDto);
  }
}
