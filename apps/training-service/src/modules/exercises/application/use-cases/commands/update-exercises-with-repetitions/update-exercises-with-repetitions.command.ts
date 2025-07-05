import { ExerciseType } from '@big-d/api-contracts';
import { GetExercisesWithRepetitionsQuery } from '../../queries';
import {
  EXERCISE_WITH_REPETITIONS_REPOSITORY,
  ExercisesWithRepetitionsRepository,
} from '@modules/exercises/application/repositories';
import { ExerciseWithRepetitionsEntity } from '@modules/exercises/domain';
import { KyselyUnitOfWork } from '@big-d/api-utils';
import { Database, DATABASE_CONNECTION, DB } from '@big-d/database';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';

interface UpdateExerciseWithRepetitionsInput {
  readonly id: number;
  readonly position?: number;
  readonly userId?: number;
  readonly name: string;
  readonly type: ExerciseType;
  readonly description?: string;
  readonly exampleUrl?: string;
  readonly repetitions: {
    readonly id?: number;
    readonly targetCount: number;
    readonly description?: string;
    readonly targetWeight: string;
    readonly targetBreak: number;
  }[];
}

@Injectable()
class UpdateExercisesWithRepetitionsCommand extends KyselyUnitOfWork<DB> {
  constructor(
    private readonly getExercisesWithRepetitions: GetExercisesWithRepetitionsQuery,

    @Inject(EXERCISE_WITH_REPETITIONS_REPOSITORY)
    private readonly kyselyExercisesWithRepetitionsRepo: ExercisesWithRepetitionsRepository,

    @Inject(DATABASE_CONNECTION) private readonly database: Database<DB>,
  ) {
    super(database);
  }

  async execute(
    input: UpdateExerciseWithRepetitionsInput,
    trx?: Transaction<DB>,
  ): Promise<ExerciseWithRepetitionsEntity> {
    const { userId, type, name, repetitions, id, exampleUrl, description, position } = input;

    const currentExercise = await this.getExercisesWithRepetitions.one({ id, userId });

    const updatedDraftedExercise = currentExercise
      .update({
        name,
        type,
        position,
        exampleUrl,
        description,
      })
      .updateRepetitions(repetitions);

    await this.useTransaction(trx).runTransaction(async (transaction) => {
      await this.kyselyExercisesWithRepetitionsRepo.save(updatedDraftedExercise, transaction);
    });

    const exercise = await this.getExercisesWithRepetitions.one({ id, userId });
    if (exercise.isTemplate) {
      throw new ForbiddenException('Exercise template cannot be changed');
    }
    return exercise;
  }
}

export { UpdateExerciseWithRepetitionsInput, UpdateExercisesWithRepetitionsCommand };
