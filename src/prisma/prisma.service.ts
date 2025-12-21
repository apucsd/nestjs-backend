import {
    Injectable,
    OnModuleInit,
    OnModuleDestroy,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient, Prisma } from 'generated/prisma/client';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    private readonly logger = new Logger(PrismaService.name);

    constructor(configService: ConfigService) {
        const database_url = configService.get<string>('DATABASE_URL');

        if (!database_url) {
            throw new Error('DATABASE_URL is not defined');
        }

        super();
    }

    async onModuleInit() {
        try {
            await this.$connect();
            await this.seed();
            this.logger.log('Successfully connected to MongoDB via Prisma');
        } catch (error) {
            this.logger.error('Failed to connect', (error as Error).stack);
            throw error;
        }
    }
    async seed() {
        const admin: Prisma.UserCreateInput = {
            name: 'Admin',
            email: 'admin@admin.com',
            password: 'admin',
            role: 'SUPER_ADMIN',
            isVerified: true,
            status: 'ACTIVE',
        };

        const isExist = await this.user.findUnique({
            where: {
                email: admin.email,
            },
        });

        if (isExist) {
            return;
        }

        await this.user.create({ data: admin });
        this.logger.log('Admin seeded successfully');
    }
    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('Prisma disconnected');
    }
}
