import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerifyOtpMail(to: string, name: string, otp: number) {
    await this.mailerService.sendMail({
      to,
      subject: 'Your OTP for verification code',
      template: 'otp-verification',
      context: { name, otp },
    });
  }

  async sendResetPasswordOtpMail(to: string, name: string, otp: number) {
    await this.mailerService.sendMail({
      to,
      subject: 'Your OTP for reset password',
      template: 'otp-reset-password',
      context: { name, otp },
    });
  }
}
