import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { PlanService } from './plan.service';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { RolesGuard } from 'src/guards/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreatePlanDto } from './dto/plan.dto';
import { UserRole } from 'generated/prisma/enums';

@Controller('plans')
export class PlanController {
    constructor(private readonly planService: PlanService) {}

    @Post()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async createPlan(@Body() payload: CreatePlanDto) {
        const result = await this.planService.createPlan(payload);
        return {
            message: 'Plan created successfully',
            data: result,
        };
    }
    @Get()
    async getAllPlans(@Query() query: Record<string, unknown>) {
        const result = await this.planService.getAllPlans(query);
        return {
            message: 'Plans fetched successfully',
            data: result.data,
            meta: result.meta,
        };
    }
    @Get(':id')
    async getPlanById(@Param('id') id: string) {
        const result = await this.planService.getPlanById(id);
        return {
            message: 'Plan fetched successfully',
            data: result,
        };
    }

    @Patch(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async updatePlan(@Param('id') id: string, @Body() payload: CreatePlanDto) {
        const result = await this.planService.updatePlan(id, payload);
        return {
            message: 'Plan updated successfully',
            data: result,
        };
    }

    @Delete(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async deletePlan(@Param('id') id: string) {
        const result = await this.planService.deletePlan(id);
        return {
            message: 'Plan deleted successfully',
            data: result,
        };
    }
}
