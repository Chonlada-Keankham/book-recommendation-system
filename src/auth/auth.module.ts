import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller'; 
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    UserModule, 
    JwtModule.register({
      secret: 'your-secret-key', 
      signOptions: { expiresIn: '1h' }, 
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
