import { ExercisesModule } from '@/modules/exercises';
import { SyncCollectionRepository } from '@big-d/api-utils';
import { forwardRef, Module } from '@nestjs/common';
import {
  TrainingTemplatesMapper,
  TrainingTemplatesWithExercisesMapper,
} from './application/mappers';
import { TRAINING_TEMPLATES_REPOSITORY } from './application/repositories';
import {
  DeleteTrainingTemplateCommand,
  CreateTrainingTemplateWithExercisesCommand,
  GetTrainingTemplatesQuery,
  UpdateTrainingTemplateWithExercisesCommand,
} from './application/use-cases';
import { KyselyTrainingTemplatesRepository } from './infra/kysely-training-templates.repository';
import { TrainingTemplatesController } from './application/training-templates.controller';
import { TrainingTemplatesService } from './application/training-templates.service';

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
    DeleteTrainingTemplateCommand,
    CreateTrainingTemplateWithExercisesCommand,
    UpdateTrainingTemplateWithExercisesCommand,
  ],
})
export class TrainingTemplatesModule {}
