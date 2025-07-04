import { ExerciseType } from '@big-d/api-contracts';
import { CreateRepetitionsUseCase, RepetitionEntity } from '@modules/repetitions';
import { KyselyUnitOfWork } from '@big-d/api-utils';
import { Database, DATABASE_CONNECTION, DB } from '@big-d/database';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Transaction } from 'kysely';
import { ExerciseWithRepetitionsEntity } from '@modules/exercises/domain';
import {
  EXERCISE_REPOSITORY,
  ExercisesRepository,
} from '@modules/exercises/application/repositories';

type CreateExerciseWithRepetitionsInput = (
  | {
      readonly trainingId?: never;
      readonly templateId?: number;
    }
  | {
      readonly templateId?: never;
      readonly trainingId?: number;
    }
) & {
  readonly userId: number;
  readonly position: number;
  readonly name: string;
  readonly type: ExerciseType;
  readonly description?: string;
  readonly exampleUrl?: string;
  readonly repetitions: {
    readonly targetCount: number;
    readonly description?: string;
    readonly targetWeight: string;
    readonly targetBreak: number;
  }[];
};

@Injectable()
class CreateExercisesWithRepetitionsCommand extends KyselyUnitOfWork<DB> {
  constructor(
    @Inject(DATABASE_CONNECTION) readonly database: Database<DB>,

    @Inject(EXERCISE_REPOSITORY)
    private readonly exercisesRepo: ExercisesRepository,

    private readonly createRepetitionsUseCase: CreateRepetitionsUseCase,
  ) {
    super(database);
  }

  async execute(
    input: CreateExerciseWithRepetitionsInput,
    trx?: Transaction<DB>,
  ): Promise<ExerciseWithRepetitionsEntity> {
    const exerciseDraft = ExerciseWithRepetitionsEntity.create({
      position: input.position,
      userId: input.userId,
      type: input.type,
      name: input.name,
      exampleUrl: input.exampleUrl,
      description: input.description,
    });

    exerciseDraft.setRepetitions(
      input.repetitions.map((rep, index) =>
        RepetitionEntity.create({ ...rep, exerciseId: exerciseDraft.id, position: index }),
      ),
    );

    if (input.templateId != null) {
      exerciseDraft.assignToTemplate({ trainingTemplateId: input.templateId });
    }

    if (input.trainingId != null) {
      exerciseDraft.assignToTraining({ trainingId: input.trainingId });
    }

    return await this.create({ exercise: exerciseDraft, userId: input.userId }, trx);
  }

  private async create(
    input: { userId: number; exercise: ExerciseWithRepetitionsEntity },
    trx?: Transaction<DB>,
  ): Promise<ExerciseWithRepetitionsEntity> {
    return await this.useTransaction(trx).runTransaction(async (transaction) => {
      const exercise = await this.exercisesRepo.create(
        {
          position: input.exercise.position,
          user_id: input.exercise.userId,
          type: input.exercise.type,
          name: input.exercise.name,
          description: input.exercise.description,
          example_url: input.exercise.exampleUrl,
          training_template_id: input.exercise.trainingTemplateId,
          training_id: input.exercise.trainingId,
        },
        transaction,
      );
      if (exercise == null) {
        throw new InternalServerErrorException('Failed to create exercise');
      }

      const repetitions = await this.createRepetitionsUseCase.execute(
        input.exercise.repetitions.map((repetition, index) => {
          return {
            position: index,
            description: repetition.description,
            targetWeight: repetition.targetWeight,
            targetCount: repetition.targetCount,
            targetBreak: repetition.targetBreak,
            exerciseId: exercise.id,
          };
        }),
        input.userId,
        transaction,
      );

      return ExerciseWithRepetitionsEntity.restore(exercise).setRepetitions(repetitions);
    });
  }
}

export { CreateExerciseWithRepetitionsInput, CreateExercisesWithRepetitionsCommand };
