import { AccountServiceClientModule } from '@/infrastructure/rmq-clients';
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';

@Module({
  imports: [AccountServiceClientModule],
  controllers: [UsersController],
})
export class UsersModule {}
