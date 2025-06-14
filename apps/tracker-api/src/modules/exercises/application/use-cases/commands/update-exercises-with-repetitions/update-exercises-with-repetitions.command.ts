import { DB } from '@/infrastructure/db';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { KyselyUnitOfWork } from '@shared/core/uow';
import { Transaction } from 'kysely';
import { ExerciseWithRepetitionsEntity } from '../../../../domain/exercise-with-repetitions.entity';
import {
  EXERCISE_WITH_REPETITIONS_REPOSITORY,
  ExercisesWithRepetitionsRepository,
} from '../../../repositories/exercises-with-repetitions.repository';
import { ExerciseType } from '../../../repositories/exercises.repository';
import { GetExercisesWithRepetitionsQuery } from '../../queries/get-exercises-with-repetitions.query';

interface UpdateExerciseWithRepetitionsInput {
  readonly id: number;
  readonly userId: number;
  readonly name: string;
  readonly type: ExerciseType;
  readonly description?: string;
  readonly exampleUrl?: string;
  readonly repetitions: {
    readonly id: number;
    readonly targetCount: number;
    readonly description?: string;
    readonly targetWeight: string;
    readonly targetBreak: number;
  }[];
}

@Injectable()
class UpdateExercisesWithRepetitionsCommand {
  constructor(
    private readonly getExercisesWithRepetitions: GetExercisesWithRepetitionsQuery,

    private readonly unitOfWork: KyselyUnitOfWork,

    @Inject(EXERCISE_WITH_REPETITIONS_REPOSITORY)
    private readonly kyselyExercisesWithRepetitionsRepo: ExercisesWithRepetitionsRepository,
  ) {}

  async execute(
    input: UpdateExerciseWithRepetitionsInput,
    trx?: Transaction<DB>,
  ): Promise<ExerciseWithRepetitionsEntity> {
    const { userId, type, name, repetitions, id, exampleUrl, description } = input;

    const currentExercise = await this.getExercisesWithRepetitions.one({ id, userId });

    const updatedDraftedExercise = currentExercise
      .update({
        name,
        type,
        exampleUrl,
        description,
      })
      .updateRepetitions(repetitions);

    try {
      await this.unitOfWork.useTransaction(trx).execute(async (transaction) => {
        await this.kyselyExercisesWithRepetitionsRepo.save(updatedDraftedExercise, transaction);
      });
    } catch (error) {
      throw new InternalServerErrorException(error, {
        cause: `Failed to update exercise {id: ${id}}`,
      });
    }

    return updatedDraftedExercise;
  }
}

export { UpdateExerciseWithRepetitionsInput, UpdateExercisesWithRepetitionsCommand };
