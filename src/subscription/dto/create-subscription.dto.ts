import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSubscriptionDto {
    @IsNotEmpty()
    @IsString({
        message: 'Plan ID is required',
    })
    planId: string;
}
