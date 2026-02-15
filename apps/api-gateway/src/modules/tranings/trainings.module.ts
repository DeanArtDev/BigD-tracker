import { TrainingServiceClientModule } from '@/infrastructure/rmq-clients';
import { Module } from '@nestjs/common';
import { TrainingsController } from './application/trainings.controller';

@Module({
  imports: [TrainingServiceClientModule],
  controllers: [TrainingsController],
})
export class TrainingsModule {}
