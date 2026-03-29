import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StripeService } from './stripe.service';
import Stripe from 'stripe';
import { StripeWebhookController } from './stripe-webhook.controller';
import { SubscriptionModule } from 'src/subscription/subscription.module';

@Global()
@Module({
    imports: [SubscriptionModule],
    providers: [
        {
            provide: 'STRIPE_CLIENT',
            useFactory: (configService: ConfigService) => {
                return new Stripe(
                    configService.get<string>('STRIPE_SECRET_KEY') as string,
                    {
                        apiVersion: '2026-01-28.clover',
                    },
                );
            },
            inject: [ConfigService],
        },
        StripeService,
    ],
    controllers: [StripeWebhookController],
    exports: ['STRIPE_CLIENT', StripeService],
})
export class StripeModule {}
