import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class MailService {
  private transporter;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: this.configService.get('EMAIL_USER'), 
        pass: this.configService.get('EMAIL_PASSWORD'), 
      },
    });
  }

  async sendResetPasswordLink(email: string, resetLink: string): Promise<void> {
    await this.transporter.sendMail({
      to: email,
      subject: 'Password Reset',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    });
  }

  async decodeConfirmationToken(token: string): Promise<string> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
      });
      if (payload && typeof payload.email === 'string') {
        return payload.email;
      }
      throw new Error('Invalid token');
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
