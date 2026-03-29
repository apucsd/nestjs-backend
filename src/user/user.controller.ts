import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Param,
    Patch,
    Req,
    UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { RolesGuard } from 'src/guards/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UpdateUserDto } from './dto/user.dto';
import { Request } from 'express';
import { UserRole } from 'generated/prisma/enums';
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}
    @Get()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async getUser(@Req() req: Request) {
        const result = await this.userService.getAllUsers(req.query);
        return {
            statusCode: HttpStatus.OK,
            message: 'Users fetched successfully',
            data: result.data,
            meta: result.meta,
        };
    }
    @Get('/profile')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async getProfile(@Req() req: Request) {
        const result = await this.userService.getProfile(req.user.id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Profile fetched successfully',
            data: result,
        };
    }

    @Patch('/update-profile')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async updateUser(@Body() body: UpdateUserDto, @Req() req: Request) {
        const result = await this.userService.updateUser(req.user!.id, body);
        return {
            statusCode: HttpStatus.OK,
            message: 'User updated successfully',
            data: result,
        };
    }

    @Get(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async getUserById(@Param('id') id: string) {
        const result = await this.userService.findUserById(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'User fetched successfully',
            data: result,
        };
    }
}
