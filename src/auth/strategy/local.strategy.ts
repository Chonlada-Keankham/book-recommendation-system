import { Strategy } from 'passport-local';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { LoginMemberDto } from '../dto/login-member-auth.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            usernameField: 'email',
            passwordField: 'password',
        });
    }

    async validate(loginMemberDto: LoginMemberDto): Promise<any> {
        const user = await this.authService.validateUser(loginMemberDto);  
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return user;
    }
}
