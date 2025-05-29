import { TrainingsModule } from '@/tranings/trainings.module';
import { UsersModule } from '@/users/users.module';
import { Module } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { ExercisesController } from './exercises.controller';
import { ExercisesRepository } from './exercises.repository';
import { ExercisesTemplatesRepository } from './exercises-templates.repository';

@Module({
  imports: [UsersModule, TrainingsModule],
  exports: [ExercisesService],
  controllers: [ExercisesController],
  providers: [ExercisesService, ExercisesRepository, ExercisesTemplatesRepository],
})
export class ExercisesModule {}
