import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from 'src/common/enum/role.enum';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, OtpType, UserStatus } from 'generated/prisma/client';

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role?: Role;
  isVerified?: boolean;
  otp?: number;
  otpExpiry?: Date;
  otpType?: OtpType;
}

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(userData: CreateUserData): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ConflictException(
        'This email is already registered. Use another email',
      );
    }

    return await this.prisma.user.create({
      data: {
        ...userData,
        role: userData.role || Role.USER,
        isVerified: userData.isVerified ?? false,
      },
    });
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    return await this.prisma.user.update({
      where: { id },
      data: { ...data },
    });
  }

  async updatePassword(id: number, hashedPassword: string): Promise<User> {
    return await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async getAllUsers(): Promise<User[]> {
    return await this.prisma.user.findMany();
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserById(id: number): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id, status: UserStatus.ACTIVE },
    });
  }

  async userExistsByEmail(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email, status: UserStatus.ACTIVE },
    });
    return !!user;
  }

  async getUserByEmailOrThrow(email: string): Promise<User> {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('This user is inactive');
    }
    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('This user is blocked');
    }
    return user;
  }

  async getUserByIdOrThrow(id: number): Promise<User> {
    const user = await this.findUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('This user is inactive');
    }
    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('This user is blocked');
    }
    return user;
  }
}
