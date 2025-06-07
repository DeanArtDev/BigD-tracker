import { ExercisesTemplateMapper } from './exercise-template.mapper';
import { Module } from '@nestjs/common';
import { ExercisesTemplatesRepository } from './exercises-templates.repository';
import { ExerciseTemplateService } from './exercise-template.service';
import { ExerciseTemplatesController } from './exercise-templates.controller';

@Module({
  exports: [ExerciseTemplateService, ExercisesTemplateMapper, ExercisesTemplatesRepository],
  controllers: [ExerciseTemplatesController],
  providers: [ExerciseTemplateService, ExercisesTemplatesRepository, ExercisesTemplateMapper],
})
export class ExerciseTemplatesModule {}
