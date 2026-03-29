import { Controller, Headers, Post, RawBodyRequest, Req } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { SubscriptionService } from 'src/subscription/subscription.service';
import { ConfigService } from '@nestjs/config';

@Controller('webhooks')
export class StripeWebhookController {
    constructor(
        private readonly stripeService: StripeService,
        private readonly subscriptionService: SubscriptionService,
        private readonly configService: ConfigService,
    ) {}

    @Post()
    async handleWebhook(
        @Req() req: RawBodyRequest<Request>,
        @Headers('stripe-signature') signature: string,
    ) {
        const event = this.stripeService.constructEvent(
            req.rawBody!,
            signature,
            this.configService.get<string>('STRIPE_WEBHOOK_SECRET')!,
        );
        console.log(event.type);

        switch (event.type) {
            case 'checkout.session.completed':
                await this.subscriptionService.handleCheckoutCompleted(
                    event.data.object,
                );
                break;

            case 'invoice.paid':
                // await this.subscriptionService.handleInvoicePaid(
                //     event.data.object,
                // );
                break;

            case 'customer.subscription.deleted':
                // await this.subscriptionService.handleSubscriptionCanceled(
                //     event.data.object,
                // );
                break;
        }

        return { received: true };
    }
}
