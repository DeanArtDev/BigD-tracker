import { AuthRmqController } from './rmq/auth.rmq.controller';
import { Module } from '@nestjs/common';

@Module({
  controllers: [AuthRmqController],
})
export class AuthPresentationModule {}
