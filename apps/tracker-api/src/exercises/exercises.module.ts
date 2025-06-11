import { RepetitionsModule } from '@/repetitions';
import { GetExercisesWithRepetitionsQuery } from './application/use-cases/queries/get-exercises-with-repetitions.query';
import { GetExercisesQuery } from './application/use-cases/queries/get-exercises.query';
import { Module } from '@nestjs/common';
import { ExercisesController } from './application/exercises.controller';
import { EXERCISE_REPOSITORY } from './application/exercises.repository';
import { ExercisesService } from './application/exercises.service';
import { ExercisesWithRepetitionsMapper } from './application/mappers/exercises-with-repetitions.mapper';
import { ExercisesMapper } from './application/mappers/exercises.mapper';
import { CreateExercisesWithRepetitionsCommand } from './application/use-cases/commands/create-exercises-with-repetitions/create-exercises-with-repetitions.command';
import { UpdateExercisesWithRepetitionsCommand } from './application/use-cases/commands/update-exercises-with-repetitions/update-exercises-with-repetitions.command';
import { DeleteExercisesWithRepetitionsCommand } from './application/use-cases/commands/delete-exercises-with-repetitions.command';
import { KyselyExercisesRepository } from './infra/kysely-exercises.repository';

@Module({
  imports: [RepetitionsModule],
  controllers: [ExercisesController],
  providers: [
    { provide: EXERCISE_REPOSITORY, useClass: KyselyExercisesRepository },
    ExercisesWithRepetitionsMapper,
    CreateExercisesWithRepetitionsCommand,
    UpdateExercisesWithRepetitionsCommand,
    DeleteExercisesWithRepetitionsCommand,
    ExercisesMapper,
    ExercisesService,
    GetExercisesQuery,
    GetExercisesWithRepetitionsQuery,
  ],
})
export class ExercisesModule {}
