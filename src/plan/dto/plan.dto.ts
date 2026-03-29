// @ts-nocheck
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PlanInterval } from 'generated/prisma/enums';
export class CreatePlanDto {
    @IsString()
    name: string;
    @IsString()
    description: string;
    @Type(() => Number)
    @IsNumber()
    @Min(1, { message: 'Price must be at least 1' })
    price: number;
    @IsString()
    @IsOptional()
    currency: string;
    @IsEnum(PlanInterval, {
        message: 'Invalid interval. Must be MONTHLY or YEARLY',
    })
    interval: PlanInterval;
}
