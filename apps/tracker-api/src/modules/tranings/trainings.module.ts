import { ExercisesModule } from '@/modules/exercises';
import { RepetitionsModule } from '@/modules/repetitions';
import { TrainingTemplatesModule } from '@/modules/traning-templates';
import { ProcessTrainingCommand } from './application/use-cases/commands/process-training';
import { KyselyUnitOfWork } from '@shared/core/uow';
import { TrainingsService } from './application/trainings.service';
import { TrainingsController } from './application/trainings.controller';
import { TrainingsMapper } from './application/mappers/trainings.mapper';
import { TRAININGS_REPOSITORY } from './application/trainings.repository';
import { forwardRef, Module } from '@nestjs/common';
import { KyselyTrainingsRepository } from './infra/kysely-trainings.repository';
import { TrainingsWithExercisesMapper } from './application/mappers/trainings-with-exercises.mapper';
import {
  AssignTrainingCommand,
  CreateTrainingByTemplateCommand,
  CreateTrainingWithExercisesCommand,
  DeleteTrainingCommand,
  GetTrainingsQuery,
  GetTrainingsWithExercisesQuery,
  UpdateTrainingWithExercisesCommand,
} from './application/use-cases';

@Module({
  imports: [ExercisesModule, RepetitionsModule, forwardRef(() => TrainingTemplatesModule)],
  exports: [TRAININGS_REPOSITORY],
  controllers: [TrainingsController],
  providers: [
    GetTrainingsWithExercisesQuery,
    TrainingsWithExercisesMapper,
    KyselyUnitOfWork,
    { provide: TRAININGS_REPOSITORY, useClass: KyselyTrainingsRepository },
    TrainingsMapper,
    GetTrainingsQuery,
    TrainingsService,
    DeleteTrainingCommand,
    CreateTrainingWithExercisesCommand,
    UpdateTrainingWithExercisesCommand,
    AssignTrainingCommand,
    CreateTrainingByTemplateCommand,
    ProcessTrainingCommand,
  ],
})
export class TrainingsModule {}
