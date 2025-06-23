import { ExercisesModule } from '@/modules/exercises';
import { forwardRef, Module } from '@nestjs/common';
import { SyncCollectionRepository } from '@shared/core/repository';
import { KyselyUnitOfWork } from '@shared/core/uow';
import {
  TrainingTemplatesMapper,
  TrainingTemplatesWithExercisesMapper,
} from './application/mappers';
import { TRAINING_TEMPLATES_REPOSITORY } from './application/repositories';
import {
  CreateTrainingTemplateCommand,
  CreateTrainingTemplateWithExercisesCommand,
  GetTrainingTemplatesQuery,
  UpdateTrainingTemplateWithExercisesCommand,
} from './application/use-cases';
import { TrainingTemplatesService } from './domain/training-templates.service';
import { KyselyTrainingTemplatesRepository } from './infra/kysely-training-templates.repository';
import { TrainingTemplatesController } from './application/training-templates.controller';

@Module({
  imports: [forwardRef(() => ExercisesModule)],
  exports: [GetTrainingTemplatesQuery],
  controllers: [TrainingTemplatesController],
  providers: [
    { provide: TRAINING_TEMPLATES_REPOSITORY, useClass: KyselyTrainingTemplatesRepository },
    GetTrainingTemplatesQuery,
    SyncCollectionRepository,
    TrainingTemplatesMapper,
    TrainingTemplatesWithExercisesMapper,
    TrainingTemplatesService,
    KyselyUnitOfWork,
    CreateTrainingTemplateWithExercisesCommand,
    CreateTrainingTemplateCommand,
    UpdateTrainingTemplateWithExercisesCommand,
  ],
})
export class TrainingTemplatesModule {}
