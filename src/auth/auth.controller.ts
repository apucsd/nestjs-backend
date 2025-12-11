import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verifyOtp.dto';
import { ForgotPasswordDto } from './dto/forgetPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { AuthGuard } from 'src/guards/auth/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('/register')
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    return {
      message:
        'User registered successfully. Please check your email for verification.',
      data: result,
    };
  }

  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      message: 'User logged in successfully',
      data: result,
    };
  }

  @Post('/verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const result = await this.authService.verifyOtp(verifyOtpDto);
    return {
      message: 'OTP verified successfully',
      data: result,
    };
  }

  @Post('/resend-registration-otp')
  async resendRegistrationOtp(@Body() body: ForgotPasswordDto) {
    const result = await this.authService.resendRegistrationOtp(body.email);
    return {
      message: 'OTP sent successfully. Please check your email.',
      data: result,
    };
  }

  @Post('/forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(forgotPasswordDto);
    return {
      message: 'Please check your email for reset password otp',
      data: result,
    };
  }

  @Post('/reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const result = await this.authService.resetPassword(resetPasswordDto);
    return {
      message: 'Password reset successfully',
      data: result,
    };
  }
  @Post('/change-password')
  @UseGuards(AuthGuard)
  async changePassword(@Req() req: Request, @Body() body: ChangePasswordDto) {
    const result = await this.authService.changePassword(req.user!.id, body);
    return {
      message: 'Password changed successfully',
      data: result,
    };
  }
}
