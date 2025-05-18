import { Controller, Get } from '@nestjs/common';
import { User } from './users.entity';
import { UsersService } from '@/users/users.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '@/auth/decorators';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Public()
  @ApiBearerAuth('access-token')
  async getUsers(): Promise<{ data: User[] }> {
    const data = await this.usersService.getAll();
    return { data };
  }
}
