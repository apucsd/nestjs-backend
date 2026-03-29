// @ts-nocheck
import {
    BadRequestException,
    Injectable,
    NotFoundException,
    Query,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { StripeService } from 'src/stripe/stripe.service';
import { CreatePlanDto } from './dto/plan.dto';
import QueryBuilder from 'src/common/utils/query-builder';

@Injectable()
export class PlanService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly stripeService: StripeService,
    ) {}
    async createPlan(payload: CreatePlanDto) {
        const product = await this.stripeService.createProduct(
            payload.name,
            payload.description,
        );
        const price = await this.stripeService.createPrice(
            payload.price,
            payload.currency || 'usd',
            product.id,
            payload.interval,
        );
        const result = await this.prisma.plan.create({
            data: {
                name: payload.name,
                description: payload.description,
                price: payload.price,
                currency: payload.currency || 'usd',
                interval: payload.interval,
                stripeProductId: product.id,
                stripePriceId: price.id,
            },
        });
        return result;
    }

    async getAllPlans(query: Record<string, unknown>) {
        return await new QueryBuilder(this.prisma.plan, {
            ...query,
            status: 'ACTIVE',
        })
            .search(['name', 'description'])
            .filter()
            .sort()
            .paginate()
            .customFields({
                id: true,
                name: true,
                description: true,
                price: true,
                currency: true,
                interval: true,
                createdAt: true,
                updatedAt: true,
            })
            .execute();
    }

    async getPlanById(id: string) {
        return await this.prisma.plan.findUnique({
            where: { id },
        });
    }

    async updatePlan(id: string, payload: Partial<CreatePlanDto>) {
        const plan = await this.prisma.plan.findUnique({
            where: { id, status: 'ACTIVE' },
        });
        if (!plan) throw new NotFoundException('Plan not found');
        if (payload.price || payload.interval || payload.currency)
            throw new BadRequestException(
                'Stripe plans price, interval and currency cannot be updated',
            );
        const result = await this.prisma.plan.update({
            where: { id },
            data: {
                name: payload.name,
                description: payload.description,
            },
        });
        return result;
    }

    async deletePlan(id: string) {
        return await this.prisma.plan.update({
            where: { id, status: 'ACTIVE' },
            data: {
                status: 'INACTIVE',
            },
        });
    }
}
