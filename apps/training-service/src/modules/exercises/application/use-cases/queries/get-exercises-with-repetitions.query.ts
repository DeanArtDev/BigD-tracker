import { DB } from '@infrastructure/types';
import { ExerciseEntity, ExerciseWithRepetitionsEntity } from '@modules/exercises/domain';
import { REPETITIONS_REPOSITORY, RepetitionsRepository } from '@modules/repetitions';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';
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
    trx?: Transaction<DB>,
  ): Promise<ExerciseWithRepetitionsEntity[]> {
    const exercises = await this.exercisesRepo.findAllByFilters(
      {
        userId: input.userId,
        trainingId: input.trainingId,
        templateId: input.templateId,
      },
      trx,
    );

    return await this.#addRepetitionsToExercises(exercises);
  }

  async allTemplates(input: {
    userId?: number;
    onlyUser?: boolean;
  }): Promise<ExerciseWithRepetitionsEntity[]> {
    const exercises = await this.exercisesRepo.findTemplatable(input);
    return await this.#addRepetitionsToExercises(exercises);
  }

  async one(input: { id: number; userId?: number }): Promise<ExerciseWithRepetitionsEntity> {
    const exercise = await this.getExercisesQuery.one({ id: input.id });
    if (!exercise.isTemplate && input.userId != null && input.userId !== exercise.userId) {
      throw new ForbiddenException('This is not yours exercise with id ' + input.id);
    }

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
      position: exercise.position,
    }).setRepetitions(repetitions);
  }

  async #addRepetitionsToExercises(
    exercises: ExerciseEntity[],
    trx?: Transaction<DB>,
  ): Promise<ExerciseWithRepetitionsEntity[]> {
    return await Promise.all<ExerciseWithRepetitionsEntity>(
      exercises.map(async (exercise) => {
        const repetitions = await this.repetitionsRepo.findAllByFilters(
          {
            exerciseId: exercise.id,
          },
          trx,
        );

        return ExerciseWithRepetitionsEntity.restore({
          id: exercise.id,
          type: exercise.type,
          name: exercise.name,
          userId: exercise.userId,
          description: exercise.description,
          exampleUrl: exercise.exampleUrl,
          trainingId: exercise.trainingId,
          trainingTemplateId: exercise.trainingTemplateId,
          position: exercise.position,
        }).setRepetitions(repetitions);
      }),
    );
  }
}
