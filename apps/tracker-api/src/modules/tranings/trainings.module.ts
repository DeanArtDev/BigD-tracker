import { ExercisesModule } from '@/modules/exercises';
import { AssignTrainingCommand } from './application/use-cases/commands/assign-training/assign-training.command';
import { UpdateTrainingWithExercisesCommand } from './application/use-cases/commands/update-training-with-exericse/update-training-with-exericse.command';
import { GetTrainingsWithExercisesQuery } from './application/use-cases/queries/get-trainings-with-exercises.query';
import { KyselyUnitOfWork } from '@shared/core/uow';
import { TrainingsService } from './application/trainings.service';
import { GetTrainingsQuery } from './application/use-cases/queries/get-trainings.query';
import { TrainingsController } from './application/trainings.controller';
import { TrainingsMapper } from './application/mappers/trainings.mapper';
import { TRAININGS_REPOSITORY } from './application/trainings.repository';
import { Module } from '@nestjs/common';
import { KyselyTrainingsRepository } from './infra/kysely-trainings.repository';
import { TrainingsWithExercisesMapper } from './application/mappers/trainings-with-exercises.mapper';
import { DeleteTrainingCommand } from './application/use-cases/commands/delete-training.command';
import { CreateTrainingWithExercisesCommand } from './application/use-cases/commands/create-training-with-exercises/create-training-with-exercises.command';

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
