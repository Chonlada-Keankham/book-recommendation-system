import { Controller, Get, Post, Body, Param} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInAuthDto } from './dto/create-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  create(@Body() signInAuthDto: SignInAuthDto) {
    return this.authService.create(signInAuthDto);
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  }

