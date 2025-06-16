import { ExerciseType, UpdateExercisesWithRepetitionsCommand } from '@/modules/exercises';
import { GetTrainingTemplateWithExercisesQuery } from '../../queries/get-training-template-with-exercises.query';
import { TrainingTemplateWithExercisesEntity } from '../../../../domain/entities';
import {
  TRAINING_TEMPLATES_REPOSITORY,
  TrainingTemplatesRepository,
} from '../../../training-templates.repository';
import { TrainingType } from '@/modules/tranings';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { KyselyUnitOfWork } from '@shared/core/uow';

interface UpdateTrainingTemplateWithExercisesInput {
  readonly id: number;
  readonly userId: number;
  readonly name: string;
  readonly type: TrainingType;
  readonly postTrainingDuration?: number;
  readonly wormUpDuration?: number;
  readonly description?: string;
  readonly exercises: {
    readonly id: number;
    readonly name: string;
    readonly type: ExerciseType;
    readonly description?: string;
    readonly exampleUrl?: string;
    readonly repetitions: {
      readonly id: number;
      readonly targetCount: number;
      readonly targetWeight: string;
      readonly targetBreak: number;
      readonly description?: string;
    }[];
  }[];
}

@Injectable()
class UpdateTrainingTemplateWithExercisesCommand {
  constructor(
    @Inject(TRAINING_TEMPLATES_REPOSITORY)
    private readonly trainingTemplateRepo: TrainingTemplatesRepository,

    private readonly updateExercisesWithRepetitions: UpdateExercisesWithRepetitionsCommand,
    private readonly getTrainingTemplateWithExercises: GetTrainingTemplateWithExercisesQuery,

    private readonly unitOfWork: KyselyUnitOfWork,
  ) {}

  async execute(
    input: UpdateTrainingTemplateWithExercisesInput,
  ): Promise<TrainingTemplateWithExercisesEntity> {
    const { exercises: exercisesDto, ...templateDto } = input;

    return await this.unitOfWork.execute(async (transaction) => {
      const template = await this.getTrainingTemplateWithExercises.one({
        id: templateDto.id,
        userId: templateDto.userId,
      });

      template
        .update({
          type: templateDto.type,
          name: templateDto.name,
          description: templateDto.description,
          postTrainingDuration: templateDto.postTrainingDuration,
          wormUpDuration: templateDto.wormUpDuration,
        })
        .updateExercises(exercisesDto);

      const updatedTemplate = await this.trainingTemplateRepo.update(
        {
          id: template.id,
          type: template.type,
          description: template.description,
          name: template.name,
          post_training_duration: template?.postTrainingDuration,
          worm_up_duration: template?.wormUpDuration,
        },
        { replace: true },
        transaction,
      );
      if (updatedTemplate == null) {
        throw new InternalServerErrorException(
          `Failed to update training template id: ${templateDto.id}`,
        );
      }

      await Promise.all(
        template.exercises.map(async (exercise) => {
          return await this.updateExercisesWithRepetitions.execute(
            {
              id: exercise.id,
              userId: template.userId,
              name: exercise.name,
              type: exercise.type,
              description: exercise.description,
              exampleUrl: exercise.exampleUrl,
              repetitions: exercise.repetitions.map((repetition) => {
                return {
                  id: repetition.id,
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

      return template;
    });
  }
}

export { UpdateTrainingTemplateWithExercisesCommand, UpdateTrainingTemplateWithExercisesInput };
