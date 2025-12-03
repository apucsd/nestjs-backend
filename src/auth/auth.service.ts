import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { UserStatus } from 'generated/prisma/enums';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async register(userDto: RegisterDto) {
    const saltOrRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS');
    const hashPassword = await bcrypt.hash(
      userDto.password,
      Number(saltOrRounds),
    );
    const user = await this.userService.createUserInDB({
      ...userDto,
      password: hashPassword,
    });
    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findUserByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('This email is not registered');
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('This user is inactive');
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
}
