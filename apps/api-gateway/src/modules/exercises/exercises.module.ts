import { Module } from '@nestjs/common';
import { ExercisesController } from './application/exercises.controller';

@Module({
  controllers: [ExercisesController],
})
export class ExercisesModule {}
