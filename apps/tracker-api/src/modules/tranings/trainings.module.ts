import { ExercisesModule } from '@/modules/exercises';
import { KyselyUnitOfWork } from '@shared/core/uow';
import { TrainingsService } from './application/trainings.service';
import { TrainingsController } from './application/trainings.controller';
import { TrainingsMapper } from './application/mappers/trainings.mapper';
import { TRAININGS_REPOSITORY } from './application/trainings.repository';
import { Module } from '@nestjs/common';
import { KyselyTrainingsRepository } from './infra/kysely-trainings.repository';
import { TrainingsWithExercisesMapper } from './application/mappers/trainings-with-exercises.mapper';
import {
  AssignTrainingCommand,
  CreateTrainingWithExercisesCommand,
  DeleteTrainingCommand,
  GetTrainingsQuery,
  GetTrainingsWithExercisesQuery,
  UpdateTrainingWithExercisesCommand,
} from './application/use-cases';

@Module({
  imports: [ExercisesModule],
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
  ],
})
export class TrainingsModule {}
