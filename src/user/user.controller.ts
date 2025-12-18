import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { RolesGuard } from 'src/guards/roles/roles.guard';
import { Role } from 'src/common/enum/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('user')
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
