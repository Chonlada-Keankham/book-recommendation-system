import { Strategy } from 'passport-local';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { LoginAuthDto } from '../dto/login-auth.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            usernameField: 'email',
            passwordField: 'password',
        });
    }

    async validate(loginAuthDto: LoginAuthDto): Promise<any> {
        const { email, password } = loginAuthDto; 
        const user = await this.authService.validateUser(loginAuthDto);  
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return user;
    }
}
