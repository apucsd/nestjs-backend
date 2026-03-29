import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { RolesGuard } from 'src/guards/roles/roles.guard';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'generated/prisma/enums';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { Request } from 'express';

@Controller('subscriptions')
export class SubscriptionController {
    constructor(private readonly subscriptionService: SubscriptionService) {}

    @Post('create-payment')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.USER, UserRole.SUPER_ADMIN)
    async createSubscriptionPayment(
        @Body() payload: CreateSubscriptionDto,
        @Req() req: Request,
    ) {
        const result = await this.subscriptionService.createSubscriptionPayment(
            req.user!.id,
            payload.planId,
        );
        return {
            success: true,
            message: 'Subscription payment created successfully',
            data: result,
        };
    }
}
