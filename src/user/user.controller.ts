import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Request,
    UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { RolesGuard } from 'src/guards/roles/roles.guard';
import { Role } from 'src/common/enum/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UpdateUserDto } from './dto/user.dto';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}
    @Get()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.USER)
    async getUser() {
        const result = await this.userService.getAllUsers();
        return {
            statusCode: 200,
            message: 'Users fetched successfully',
            data: result,
        };
    }

    @Patch('/update-profile')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.USER, Role.ADMIN, Role.SUPER_ADMIN)
    async updateUser(@Body() body: UpdateUserDto, @Request() req) {
        const result = await this.userService.updateUser(req.user.id, body);
        return {
            statusCode: 200,
            message: 'User updated successfully',
            data: result,
        };
    }

    @Get(':id')
    async getUserById(@Param('id') id: string) {
        const result = await this.userService.findUserById(id);
        return {
            statusCode: 200,
            message: 'User fetched successfully',
            data: result,
        };
    }
}
