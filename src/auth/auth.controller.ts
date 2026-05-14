import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) { }
    @Post('/register')
    async register(@Body() registerDto: RegisterDto) {
        await this.authService.register(registerDto);
        return {
            message:
                'User registered successfully. Please check your email for verification.',
            data: null,
        };
    }
    // redirectTo=com.yourapp://auth-callback
    // Before use this must need configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file
    @Get('/google')
    @UseGuards(GoogleAuthGuard)
    async googleLogin() { }

    @Get('/google/callback')
    @UseGuards(GoogleAuthGuard)
    async googleLoginCallback(@Req() req: Request, @Res() res: Response) {
        const { refreshToken, accessToken } = req.user as any;

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: this.configService.get('NODE_ENV') === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });


        console.log(req.query);
        const redirectTo = req.query.state || 'com.yourapp://auth-callback';

        return res.redirect(
            `${redirectTo}?accessToken=${accessToken}&refreshToken=${refreshToken}`,
        );
    }

    @Post('/login')
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { refreshToken, ...rest } =
            await this.authService.login(loginDto);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: this.configService.get('NODE_ENV') === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        return {
            message: 'User logged in successfully',
            data: rest,
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
        const result = await this.authService.changePassword(
            req.user!.id,
            body,
        );
        return {
            message: 'Password changed successfully',
            data: result,
        };
    }

    @Post('/refresh-token')
    async refreshToken(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const token = req.cookies['refreshToken'];
        if (!token) {
            throw new UnauthorizedException('Refresh token not found');
        }
        const result = await this.authService.refreshToken(token);
        return {
            message: 'Token refreshed successfully',
            data: result,
        };
    }
}
