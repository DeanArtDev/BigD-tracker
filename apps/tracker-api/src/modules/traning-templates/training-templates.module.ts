import { ExercisesModule } from '@/modules/exercises';
import { Module } from '@nestjs/common';
import { KyselyUnitOfWork } from '@shared/core/uow';
import {
  TrainingTemplatesMapper,
  TrainingTemplatesWithExercisesMapper,
} from './application/mappers';
import { TRAINING_TEMPLATES_REPOSITORY } from './application/training-templates.repository';
import {
  GetTrainingTemplatesQuery,
  CreateTrainingTemplateWithExercisesCommand,
  GetTrainingTemplateWithExercisesQuery,
} from './application/use-cases';
import { TrainingTemplatesService } from './domain/training-templates.service';
import { KyselyTrainingTemplatesRepository } from './infra/kysely-training-templates.repository';
import { TrainingTemplatesController } from './training-templates.controller';

@Module({
  imports: [ExercisesModule],
  controllers: [TrainingTemplatesController],
  providers: [
    { provide: TRAINING_TEMPLATES_REPOSITORY, useClass: KyselyTrainingTemplatesRepository },
    GetTrainingTemplatesQuery,
    GetTrainingTemplateWithExercisesQuery,
    TrainingTemplatesMapper,
    TrainingTemplatesWithExercisesMapper,
    TrainingTemplatesService,
    KyselyUnitOfWork,
    CreateTrainingTemplateWithExercisesCommand,
  ],
})
export class TrainingTemplatesModule {}
