// @ts-nocheck
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { StripeService } from 'src/stripe/stripe.service';
import Stripe from 'stripe';

@Injectable()
export class SubscriptionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly stripeService: StripeService,
    ) {}

    async createSubscriptionPayment(userId: string, planId: string) {
        const plan = await this.prisma.plan.findUnique({
            where: {
                id: planId,
            },
        });
        if (!plan) throw new BadRequestException('Plan not found');

        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                stripeCustomerId: true,
                email: true,
                name: true,
            },
        });
        if (!user) throw new Error('User not found');

        let stripeCustomerId = user.stripeCustomerId;
        if (!stripeCustomerId) {
            const customer = await this.stripeService.createCustomer(
                user.name,
                user.email,
            );
            stripeCustomerId = customer.id;
            await this.prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    stripeCustomerId,
                },
            });
        }

        const session = await this.stripeService.createCheckoutSession({
            customerId: stripeCustomerId!,
            priceId: plan.stripePriceId!,
            mode: 'subscription',
            metadata: {
                userId,
                planId,
            },
        });
        return session.url;
    }

    async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
        const { userId, planId } = session.metadata as {
            userId: string;
            planId: string;
        };

        const currentDate = new Date();
        const nextMonthDate = new Date(
            currentDate.setMonth(currentDate.getMonth() + 1),
        );
        console.log(userId, planId);
        await this.prisma.subscription.create({
            data: {
                userId,
                planId,
                status: 'ACTIVE',
                currentPeriodStart: new Date(session.created * 1000),
                currentPeriodEnd: nextMonthDate,
            },
        });
    }
}
