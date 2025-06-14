import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  exports: [UsersService],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
})
export class UsersModule {}
