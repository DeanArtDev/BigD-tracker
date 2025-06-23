import { DB } from '@/infrastructure/db';
import { CreateRepetitionsService, RepetitionEntity } from '@/modules/repetitions';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { KyselyUnitOfWork } from '@shared/core/uow';
import { Transaction } from 'kysely';
import { ExerciseWithRepetitionsEntity } from '../../../../domain/exercise-with-repetitions.entity';
import {
  EXERCISE_REPOSITORY,
  ExercisesRepository,
  ExerciseType,
} from '../../../repositories/exercises.repository';

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
class CreateExercisesWithRepetitionsCommand {
  constructor(
    @Inject(EXERCISE_REPOSITORY)
    private readonly exercisesRepo: ExercisesRepository,

    private readonly createRepetitionsService: CreateRepetitionsService,
    private readonly unitOfWork: KyselyUnitOfWork,
  ) {}

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

    return await this.unitOfWork.useTransaction(trx).execute(async (transaction) => {
      return await this.create({ exercise: exerciseDraft, userId: input.userId }, transaction);
    });
  }

  private async create(
    input: { userId: number; exercise: ExerciseWithRepetitionsEntity },
    trx?: Transaction<DB>,
  ): Promise<ExerciseWithRepetitionsEntity> {
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
      trx,
    );
    if (exercise == null) {
      throw new InternalServerErrorException('Failed to create exercise');
    }

    const repetitions = await this.createRepetitionsService.execute(
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
      trx,
    );

    return ExerciseWithRepetitionsEntity.restore(exercise).setRepetitions(repetitions);
  }
}

export { CreateExerciseWithRepetitionsInput, CreateExercisesWithRepetitionsCommand };
