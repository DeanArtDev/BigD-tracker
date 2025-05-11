import { Body, Controller, Get, HttpStatus, Post } from '@nestjs/common';
import { User } from './users.entity';
import { UsersService } from '@/users/users.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto, CreateUserResponseDto } from './schemas/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers(): Promise<{ data: User[] }> {
    const data = await this.usersService.getAll();
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'User creating' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User creation successfully',
    type: CreateUserResponseDto,
  })
  async create(@Body() body: CreateUserDto): Promise<{ data: User }> {
    const newUser = await this.usersService.createUser(body);
    return { data: newUser };
  }
}
