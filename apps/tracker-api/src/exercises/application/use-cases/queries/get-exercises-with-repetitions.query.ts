import { REPETITIONS_REPOSITORY, RepetitionsRepository } from '@/repetitions';
import { Inject, Injectable } from '@nestjs/common';
import { ExerciseWithRepetitionsEntity } from '../../../domain/exercise-with-repetitions.entity';
import { ExerciseWithRepetitionsDto } from '../../dtos/exercise-with-repetitions.dto';
import { EXERCISE_REPOSITORY, ExercisesRepository } from '../../exercises.repository';
import { GetExercisesQuery } from './get-exercises.query';

@Injectable()
export class GetExercisesWithRepetitionsQuery {
  constructor(
    @Inject(EXERCISE_REPOSITORY)
    private readonly exercisesRepo: ExercisesRepository,

    @Inject(REPETITIONS_REPOSITORY)
    private readonly repetitionsRepo: RepetitionsRepository,

    private readonly getExercisesQuery: GetExercisesQuery,
  ) {}

  async all(input: { my: boolean; userId: number }): Promise<ExerciseWithRepetitionsDto[]> {
    const { my, userId } = input;
    const exercises = await this.exercisesRepo.findAllByFilters({ userId, my });

    return await Promise.all<ExerciseWithRepetitionsDto>(
      exercises.map(async (exercise) => {
        const repetitions = await this.repetitionsRepo.findAllByFilters({
          exerciseId: exercise.id,
        });

        return ExerciseWithRepetitionsEntity.restore({
          id: exercise.id,
          type: exercise.type,
          name: exercise.name,
          userId: exercise.userId,
          description: exercise.description,
          exampleUrl: exercise.exampleUrl,
          repetitions,
        });
      }),
    );
  }

  async one(input: { id: number; userId?: number }): Promise<ExerciseWithRepetitionsEntity> {
    const exercise = await this.getExercisesQuery.one({ id: input.id, userId: input.userId });

    const repetitions = await this.repetitionsRepo.findAllByFilters({
      exerciseId: input.id,
      userId: input.userId,
    });

    return ExerciseWithRepetitionsEntity.restore({
      id: exercise.id,
      type: exercise.type,
      name: exercise.name,
      userId: exercise.userId,
      description: exercise.description,
      exampleUrl: exercise.exampleUrl,
      repetitions,
    });
  }
}
