import { CreateExercisesWithRepetitionsCommand } from '@/modules/exercises/application/use-cases';
import { RepetitionEntity } from '@/modules/repetitions';
import { TrainingTemplateWithExercisesEntity } from '@/modules/traning-templates/domain/entities';
import { ExerciseType, TrainingType } from '@big-d/api-contracts';
import { KyselyUnitOfWork } from '@big-d/api-utils';
import { Database, DATABASE_CONNECTION } from '@big-d/database';
import { DB } from '@infrastructure/types';
import { ExerciseWithRepetitionsEntity } from '@modules/exercises/domain';
import {
  TRAINING_TEMPLATES_REPOSITORY,
  TrainingTemplatesRepository,
} from '@modules/traning-templates/application/repositories';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';

interface CreateTrainingTemplateWithExercisesInput {
  readonly userId: number;
  readonly name: string;
  readonly type: TrainingType;
  readonly postTrainingDuration?: number;
  readonly wormUpDuration?: number;
  readonly description?: string;
  readonly exercises: {
    readonly name: string;
    readonly type: ExerciseType;
    readonly description?: string;
    readonly exampleUrl?: string;
    readonly repetitions: {
      readonly targetCount: number;
      readonly targetWeight: string;
      readonly targetBreak: number;
      readonly description?: string;
    }[];
  }[];
}

@Injectable()
class CreateTrainingTemplateWithExercisesCommand extends KyselyUnitOfWork<DB> {
  constructor(
    @Inject(DATABASE_CONNECTION) readonly database: Database<DB>,

    @Inject(TRAINING_TEMPLATES_REPOSITORY)
    private readonly trainingTemplateRepo: TrainingTemplatesRepository,

    private readonly createExercisesWithRepetitions: CreateExercisesWithRepetitionsCommand,
  ) {
    super(database);
  }

  async execute(input: CreateTrainingTemplateWithExercisesInput): Promise<TrainingTemplateWithExercisesEntity> {
    const { exercises, ...training } = input;

    return await this.runTransaction(async (transaction) => {
      const draftTemplate = TrainingTemplateWithExercisesEntity.create(training);

      draftTemplate.setExercises(
        exercises.map((exercise, index) => {
          const newExercise = ExerciseWithRepetitionsEntity.create({
            ...exercise,
            position: index,
          });
          return newExercise
            .setRepetitions(
              exercise.repetitions.map((rep, index) =>
                RepetitionEntity.create({ ...rep, position: index, exerciseId: newExercise.id }),
              ),
            )
            .assignToTemplate({ trainingTemplateId: draftTemplate.id });
        }),
      );

      const newTemplate = await this.trainingTemplateRepo.create(
        {
          user_id: draftTemplate.userId,
          type: draftTemplate.type,
          description: draftTemplate.description,
          name: draftTemplate.name,
          post_training_duration: training?.postTrainingDuration,
          worm_up_duration: draftTemplate?.wormUpDuration,
        },
        transaction,
      );
      if (newTemplate == null) {
        throw new InternalServerErrorException('Failed to create training template');
      }

      const newExercises = await Promise.all(
        draftTemplate.exercises.map(async (exercise, index) => {
          return await this.createExercisesWithRepetitions.execute(
            {
              position: index,
              userId: training.userId,
              name: exercise.name,
              type: exercise.type,
              description: exercise.description,
              exampleUrl: exercise.exampleUrl,
              templateId: newTemplate.id,
              repetitions: exercise.repetitions.map((repetition) => {
                return {
                  userId: training.userId,
                  targetCount: repetition.targetCount,
                  targetWeight: repetition.targetWeight,
                  description: repetition.description,
                  targetBreak: repetition.targetBreak,
                };
              }),
            },
            transaction,
          );
        }),
      );

      return TrainingTemplateWithExercisesEntity.restore(newTemplate).setExercises(newExercises);
    });
  }
}

export { CreateTrainingTemplateWithExercisesCommand, CreateTrainingTemplateWithExercisesInput };
