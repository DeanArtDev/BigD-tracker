import { ExercisesTemplateMapper } from './exercise-template.mapper';
import { ExercisesMapper } from './exercise.mapper';
import { Module } from '@nestjs/common';
import { ExercisesTemplatesRepository } from './exercises-templates.repository';
import { ExercisesController } from './exercises.controller';
import { ExercisesRepository } from './exercises.repository';
import { ExercisesService } from './exercises.service';

@Module({
  exports: [
    ExercisesService,
    ExercisesMapper,
    ExercisesRepository,
    ExercisesTemplateMapper,
    ExercisesTemplatesRepository,
  ],
  controllers: [ExercisesController],
  providers: [
    ExercisesService,
    ExercisesRepository,
    ExercisesTemplatesRepository,
    ExercisesMapper,
    ExercisesTemplateMapper,
  ],
})
export class ExercisesModule {}
