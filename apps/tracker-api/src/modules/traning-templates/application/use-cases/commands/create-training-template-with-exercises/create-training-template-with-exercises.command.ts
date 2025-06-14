import {
  CreateExercisesWithRepetitionsCommand,
  ExerciseType,
  ExerciseWithRepetitionsEntity,
} from '@/modules/exercises';
import { RepetitionEntity } from '@/modules/repetitions';
import {
  TRAINING_TEMPLATES_REPOSITORY,
  TrainingTemplatesRepository,
} from '../../../training-templates.repository';
import { TrainingTemplateWithExercisesEntity } from '../../../../domain/entities';
import { TrainingType } from '@/modules/tranings';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { KyselyUnitOfWork } from '@shared/core/uow';

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
class CreateTrainingTemplateWithExercisesCommand {
  constructor(
    @Inject(TRAINING_TEMPLATES_REPOSITORY)
    private readonly trainingTemplateRepo: TrainingTemplatesRepository,

    private readonly unitOfWork: KyselyUnitOfWork,
    private readonly createExercisesWithRepetitions: CreateExercisesWithRepetitionsCommand,
  ) {}

  async execute(
    input: CreateTrainingTemplateWithExercisesInput,
  ): Promise<TrainingTemplateWithExercisesEntity> {
    const { exercises, ...training } = input;

    return await this.unitOfWork.execute(async (transaction) => {
      const draftTemplate = TrainingTemplateWithExercisesEntity.create(training);

      draftTemplate.setExercises(
        exercises.map((exercise) =>
          ExerciseWithRepetitionsEntity.create(exercise)
            .setRepetitions(exercise.repetitions.map(RepetitionEntity.create))
            .assignToTemplate({ trainingTemplateId: draftTemplate.id }),
        ),
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
        draftTemplate.exercises.map(async (exercise) => {
          return await this.createExercisesWithRepetitions.execute(
            {
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
