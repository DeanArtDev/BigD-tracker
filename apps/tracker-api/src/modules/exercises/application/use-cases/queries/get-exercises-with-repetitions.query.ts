import { REPETITIONS_REPOSITORY, RepetitionsRepository } from '@/modules/repetitions';
import { Inject, Injectable } from '@nestjs/common';
import { ExerciseWithRepetitionsEntity } from '../../../domain/exercise-with-repetitions.entity';
import { EXERCISE_REPOSITORY, ExercisesRepository } from '../../repositories/exercises.repository';
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

  async all(
    input: (
      | { trainingId?: never; templateId?: number }
      | { trainingId?: number; templateId?: never }
    ) & { userId?: number; onlyUser?: boolean },
  ): Promise<ExerciseWithRepetitionsEntity[]> {
    const exercises = await this.exercisesRepo.findAllByFilters({
      userId: input.userId,
      trainingId: input.trainingId,
      templateId: input.templateId,
    });

    return await Promise.all<ExerciseWithRepetitionsEntity>(
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
          trainingId: exercise.trainingId,
          trainingTemplateId: exercise.trainingTemplateId,
        }).setRepetitions(repetitions);
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
    }).setRepetitions(repetitions);
  }
}
