import { Module } from '@nestjs/common';
import { TrainingsController } from './application/trainings.controller';

@Module({
  controllers: [TrainingsController],
})
export class TrainingsModule {}
