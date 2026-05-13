import { UserRmqController } from './rmq/users.rmq.controller';
import { AuthRmqController } from './rmq/auth.rmq.controller';
import { Module } from '@nestjs/common';

@Module({
  controllers: [AuthRmqController, UserRmqController],
})
export class AuthPresentationModule {}
