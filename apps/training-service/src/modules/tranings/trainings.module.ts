import { ExercisesModule } from '@/modules/exercises';
import { RepetitionsModule } from '@/modules/repetitions';
import { TrainingTemplatesModule } from '@/modules/traning-templates';
import { forwardRef, Module } from '@nestjs/common';
import { TrainingsWithExercisesMapper } from './application/mappers/trainings-with-exercises.mapper';
import { TrainingsMapper } from './application/mappers/trainings.mapper';
import { TrainingsController } from './application/trainings.controller';
import { TRAININGS_REPOSITORY } from './application/trainings.repository';
import { TrainingsService } from './application/trainings.service';
import {
  AssignTrainingCommand,
  CreateTrainingByTemplateCommand,
  CreateTrainingWithExercisesCommand,
  DeleteTrainingCommand,
  GetTrainingsQuery,
  GetTrainingsWithExercisesQuery,
  ProcessTrainingCommand,
  UpdateTrainingWithExercisesCommand,
} from './application/use-cases';
import { KyselyTrainingsRepository } from './infra/kysely-trainings.repository';

@Module({
  imports: [ExercisesModule, RepetitionsModule, forwardRef(() => TrainingTemplatesModule)],
  exports: [TRAININGS_REPOSITORY],
  controllers: [TrainingsController],
  providers: [
    GetTrainingsWithExercisesQuery,
    TrainingsWithExercisesMapper,
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
