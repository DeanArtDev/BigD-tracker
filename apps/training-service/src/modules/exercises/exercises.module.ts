import { SyncCollectionRepository } from '@big-d/api-utils';
import {
  EXERCISE_REPOSITORY,
  EXERCISE_WITH_REPETITIONS_REPOSITORY,
  ExercisesController,
  ExercisesMapper,
  ExercisesService,
  ExercisesWithRepetitionsMapper,
} from '@modules/exercises/application';
import {
  CreateExercisesWithRepetitionsCommand,
  DeleteExercisesWithRepetitionsCommand,
  GetExercisesQuery,
  GetExercisesWithRepetitionsQuery,
  UpdateExercisesWithRepetitionsCommand,
} from '@modules/exercises/application/use-cases';
import { RepetitionsModule } from '@modules/repetitions';
import { Module } from '@nestjs/common';
import { KyselyExercisesWithRepetitionsRepository } from './infra/kysely-exercises-with-repetitions.repository';
import { KyselyExercisesRepository } from './infra/kysely-exercises.repository';

@Module({
  exports: [
    GetExercisesWithRepetitionsQuery,
    ExercisesWithRepetitionsMapper,
    EXERCISE_REPOSITORY,
    EXERCISE_WITH_REPETITIONS_REPOSITORY,
    CreateExercisesWithRepetitionsCommand,
    UpdateExercisesWithRepetitionsCommand,
  ],
  imports: [RepetitionsModule],
  controllers: [ExercisesController],
  providers: [
    { provide: EXERCISE_REPOSITORY, useClass: KyselyExercisesRepository },
    {
      provide: EXERCISE_WITH_REPETITIONS_REPOSITORY,
      useClass: KyselyExercisesWithRepetitionsRepository,
    },
    GetExercisesWithRepetitionsQuery,
    ExercisesWithRepetitionsMapper,
    CreateExercisesWithRepetitionsCommand,
    UpdateExercisesWithRepetitionsCommand,
    DeleteExercisesWithRepetitionsCommand,
    ExercisesMapper,
    ExercisesService,
    GetExercisesQuery,
    SyncCollectionRepository,
  ],
})
export class ExercisesModule {}
