// @ts-nocheck
import { Inject, Injectable } from '@nestjs/common';
import { PlanInterval } from 'generated/prisma/enums';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    constructor(
        @Inject('STRIPE_CLIENT') private readonly stripeClient: Stripe,
    ) {}

    constructEvent(rawBody: Buffer, signature: string, secret: string) {
        return this.stripeClient.webhooks.constructEvent(
            rawBody,
            signature,
            secret,
        );
    }
    async createProduct(name: string, description: string) {
        return this.stripeClient.products.create({
            name,
            description,
        });
    }
    async createPrice(
        price: number,
        currency: string,
        productId: string,
        interval: PlanInterval,
    ) {
        const intervalMap = {
            [PlanInterval.MONTHLY]: 'month',
            [PlanInterval.YEARLY]: 'year',
        };
        return this.stripeClient.prices.create({
            unit_amount: price * 100,
            currency,
            product: productId,
            recurring: {
                interval: intervalMap[interval] as 'month' | 'year',
            },
        });
    }
    async createCustomer(name: string, email: string) {
        return this.stripeClient.customers.create({
            name,
            email,
        });
    }

    async createCheckoutSession(options: {
        customerId?: string;
        priceId?: string;
        amount?: number;
        currency?: string;
        mode: 'payment' | 'subscription';
        metadata?: Record<string, string>;
    }) {
        if (options.priceId) {
            return this.stripeClient.checkout.sessions.create({
                customer: options.customerId,
                mode: options.mode,
                line_items: [
                    {
                        price: options.priceId,
                        quantity: 1,
                    },
                ],
                metadata: options.metadata,
                success_url: 'http://localhost:3000/success',
                cancel_url: 'http://localhost:3000/cancel',
            });
        }

        return this.stripeClient.checkout.sessions.create({
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: options.currency || 'usd',
                        product_data: { name: 'Custom Payment' },
                        unit_amount: options.amount! * 100,
                    },
                    quantity: 1,
                },
            ],
            metadata: options.metadata,
            success_url: 'http://localhost:3000/success',
            cancel_url: 'http://localhost:3000/cancel',
        });
    }
}
