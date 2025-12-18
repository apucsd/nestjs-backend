import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}
  private readonly logger = new Logger(MailService.name);

  async sendVerifyOtpMail(to: string, name: string, otp: number) {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Your OTP for verification code',
        template: 'otp-verification',
        context: { name, otp },
      });
      this.logger.log('Verify OTP mail sent successfully');
    } catch (error) {
      this.logger.error(error);
    }
  }

  async sendResetPasswordOtpMail(to: string, name: string, otp: number) {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Your OTP for reset password',
        template: 'otp-reset-password',
        context: { name, otp },
      });
      this.logger.log('Reset Password OTP mail sent successfully');
    } catch (error) {
      this.logger.error(error);
    }
  }
}
