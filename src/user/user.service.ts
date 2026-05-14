import {
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, UserRole, UserStatus } from 'generated/prisma/client';
import { CreateUserDto } from './dto/user.dto';
import QueryBuilder from 'src/common/utils/query-builder';
import { SocialUserDto } from 'src/auth/dto/social-login.dto';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId, status: UserStatus.ACTIVE },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                address: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async createUser(userData: CreateUserDto): Promise<User> {
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
                role: userData.role || UserRole.USER,
                isVerified: userData.isVerified ?? false,
            },
        });
    }

    async findOrCreateSocialUser(dto: SocialUserDto): Promise<User> {
        let user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        // console.log('Existing user', user);

        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    name: dto.name,
                    image: dto.image,
                    provider: dto.provider,
                    providerId: dto.providerId,
                    isVerified: true,
                    status: UserStatus.ACTIVE,
                    password: undefined,
                },
            });
        } else if (!user.provider) {
            user = await this.prisma.user.update({
                where: { email: dto.email },
                data: {
                    provider: dto.provider,
                    providerId: dto.providerId,
                    image: user.image ?? dto.image,
                },
            });
        }

        return user;
    }

    async updateUser(id: string, data: Partial<User>): Promise<User> {
        return await this.prisma.user.update({
            where: { id },
            data: { ...data },
        });
    }

    async updatePassword(id: string, hashedPassword: string): Promise<User> {
        return await this.prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        });
    }

    async getAllUsers(query: Record<string, unknown>) {
        const builder = new QueryBuilder(this.prisma.user, query);
        const result = await builder
            .search(['name', 'email', 'phone'])
            .filter()
            .sort()
            .paginate()
            .fields()
            .exclude()
            .customFields({
                id: true,
                email: true,
                name: true,
                image: true,
                phone: true,
                address: true,
                createdAt: true,
            })
            .execute();
        return result;
    }

    async findUserByEmail(email: string): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findUserById(id: string): Promise<User | null> {
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

    async getUserByIdOrThrow(id: string): Promise<User> {
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
