import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret:' ',
      signOptions : {expiresIn : '60m'}
    })
  ],
  controllers: [AuthController],
  providers: [AuthService
    
  ],
})
export class AuthModule { }
