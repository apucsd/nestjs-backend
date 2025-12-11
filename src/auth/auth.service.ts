import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import { UserStatus, OtpType } from 'generated/prisma/client';
import { generateOtp, generateOtpExpiry } from 'src/common/utils/otp.util';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verifyOtp.dto';
import { ForgotPasswordDto } from './dto/forgetPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { JwtPayload } from 'src/types/express';

interface JwtPayloadWithPurpose extends JwtPayload {
  purpose?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async register(userDto: RegisterDto) {
    const saltOrRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS');
    const hashedPassword = await bcrypt.hash(
      userDto.password,
      Number(saltOrRounds),
    );

    const otp = generateOtp();
    const otpExpiry = generateOtpExpiry();

    const user = await this.userService.createUser({
      ...userDto,
      password: hashedPassword,
      isVerified: false,
      otp: otp,
      otpExpiry: otpExpiry,
      otpType: OtpType.REGISTRATION,
    });

    await this.mailService.sendVerifyOtpMail(userDto.email, userDto.name, otp);

    return user;
  }

  async resendRegistrationOtp(email: string) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      throw new UnauthorizedException('This user is already verified');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('This user is blocked');
    }

    const otp = generateOtp();
    const otpExpiry = generateOtpExpiry();

    await this.userService.updateUser(user.id, {
      otp: otp,
      otpExpiry: otpExpiry,
      otpType: OtpType.REGISTRATION,
    });

    await this.mailService.sendVerifyOtpMail(user.email, user.name, otp);

    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findUserByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('This email is not registered');
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('This user is inactive');
    }
    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('This user is blocked');
    }

    const isPasswordMatch = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordMatch) {
      throw new UnauthorizedException('This password is not correct');
    }

    const accessToken = await this.jwtService.signAsync({
      email: user.email,
      id: user.id,
      role: user.role,
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      accessToken,
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const existingUser = await this.userService.findUserByEmail(
      verifyOtpDto.email,
    );
    if (!existingUser) {
      throw new UnauthorizedException('This email is not registered');
    }

    if (existingUser.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('This user is inactive');
    }

    if (existingUser.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('This user is blocked');
    }

    if (!existingUser.otpExpiry || existingUser.otpExpiry < new Date()) {
      throw new UnauthorizedException(
        'OTP has expired. Please try resending OTP.',
      );
    }

    if (Number(existingUser?.otp) !== Number(verifyOtpDto.otp)) {
      throw new UnauthorizedException(
        'Your OTP is not correct. Please provide correct OTP.',
      );
    }

    if (existingUser.otpType === OtpType.REGISTRATION) {
      if (existingUser.isVerified) {
        throw new UnauthorizedException('This user is already verified');
      }

      await this.userService.updateUser(existingUser.id, {
        isVerified: true,
        otp: null,
        otpExpiry: null,
        otpType: null,
      });

      const accessToken = await this.jwtService.signAsync({
        email: existingUser.email,
        id: existingUser.id,
        role: existingUser.role,
      });

      return {
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
        accessToken,
      };
    }

    if (existingUser.otpType === OtpType.PASSWORD_RESET) {
      const resetToken = this.jwtService.sign(
        { sub: existingUser.id, purpose: 'PASSWORD_RESET' },
        { expiresIn: '2m' },
      );

      await this.userService.updateUser(existingUser.id, {
        otp: null,
        otpExpiry: null,
        otpType: null,
      });

      return { resetToken };
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userService.findUserByEmail(
      forgotPasswordDto.email,
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = generateOtp();
    const otpExpiry = generateOtpExpiry();

    await this.userService.updateUser(user.id, {
      otp: otp,
      otpExpiry: otpExpiry,
      otpType: OtpType.PASSWORD_RESET,
    });

    await this.mailService.sendResetPasswordOtpMail(user.email, user.name, otp);

    return null;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const secret = this.configService.get<string>('JWT_SECRET');

    let decodedToken: JwtPayloadWithPurpose;
    try {
      decodedToken = await this.jwtService.verifyAsync<JwtPayloadWithPurpose>(
        resetPasswordDto.resetToken,
        { secret },
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Your reset token has expired');
      }
      throw new UnauthorizedException('Invalid reset token');
    }

    if (decodedToken.purpose !== 'PASSWORD_RESET') {
      throw new UnauthorizedException('Invalid reset token');
    }

    const user = await this.userService.findUserById(decodedToken.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const saltOrRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS');
    const hashedPassword = await bcrypt.hash(
      resetPasswordDto.newPassword,
      Number(saltOrRounds),
    );

    await this.userService.updatePassword(user.id, hashedPassword);

    return null;
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordMatch = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );
    if (!isPasswordMatch) {
      throw new UnauthorizedException('This password is not correct');
    }

    const saltOrRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS');
    const hashedPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      Number(saltOrRounds),
    );

    await this.userService.updatePassword(user.id, hashedPassword);

    return null;
  }
}
