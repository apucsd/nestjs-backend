import { ConflictException, Injectable } from '@nestjs/common';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { Role } from 'src/common/enum/role.enum';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async createUserInDB(userData: RegisterDto) {
    const isExistWithSameEmail = await this.prisma.user.findUnique({
      where: {
        email: userData.email,
      },
    });
    if (isExistWithSameEmail) {
      throw new ConflictException(
        'This email is already registered. Use another email',
      );
    }
    return await this.prisma.user.create({
      data: {
        ...userData,
        role: userData.role || Role.USER,
      },
    });
  }
  async getUserFromDB() {
    try {
      return await this.prisma.user.findMany();
    } catch (error) {
      console.log(error);
    }
  }
  async findUserByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }
}
