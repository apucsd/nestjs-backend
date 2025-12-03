import { Body, Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/guards/auth/auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  @UseGuards(AuthGuard)
  async getUser() {
    const result = await this.userService.getUserFromDB();
    return {
      statusCode: 200,
      message: 'User fetched successfully',
      data: result,
    };
  }
}
