import { Controller, Get } from '@nestjs/common';
import { User } from './users.entity';
import { UsersService } from '@/users/users.service';
import { Public, TokenPayload } from '@/auth/decorators';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AccessTokenPayload } from '@/auth/entities/access-token.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiBearerAuth('access-token')
  async getUsers(
      @TokenPayload() payload: AccessTokenPayload): Promise<{ data: User[] }> {
    const data = await this.usersService.getAll();
    return { data };
  }
}
