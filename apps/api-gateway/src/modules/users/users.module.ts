import { AuthServiceClientModule } from '@/infrastructure/rmq-clients';
import { UserResolver } from './graphql/reslovers/user.resolver';
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';

@Module({
  providers: [UserResolver],
  imports: [AuthServiceClientModule],
  controllers: [UsersController],
})
export class UsersModule {}
