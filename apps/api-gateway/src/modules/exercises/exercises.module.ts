import { TrainingServiceClientModule } from '@/infrastructure/rmq-clients';
import { Module } from '@nestjs/common';
import { ExercisesController } from './application/exercises.controller';

@Module({
  imports: [TrainingServiceClientModule],
  controllers: [ExercisesController],
})
export class ExercisesModule {}
