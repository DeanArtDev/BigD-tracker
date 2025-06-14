import { ExerciseType, UpdateExercisesWithRepetitionsCommand } from '@/modules/exercises';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { KyselyUnitOfWork } from '@shared/core/uow';
import { TrainingWithExercisesEntity } from '../../../../domain/entities/training-with-exercises.entity';
import {
  TRAININGS_REPOSITORY,
  TrainingsRepository,
  TrainingType,
} from '../../../trainings.repository';
import { GetTrainingsWithExercisesQuery } from '../../queries/get-trainings-with-exercises.query';

interface UpdateTrainingWithExercisesInput {
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
class UpdateTrainingWithExercisesCommand {
  constructor(
    @Inject(TRAININGS_REPOSITORY)
    private readonly trainingsRepo: TrainingsRepository,

    private readonly getTrainingsWithExercises: GetTrainingsWithExercisesQuery,
    private readonly updateExercisesWithRepetitions: UpdateExercisesWithRepetitionsCommand,

    private readonly unitOfWork: KyselyUnitOfWork,
  ) {}

  async execute(input: UpdateTrainingWithExercisesInput): Promise<TrainingWithExercisesEntity> {
    const { exercises: exercisesDto, ...trainingDto } = input;

    return await this.unitOfWork.execute(async (transaction) => {
      const training = await this.getTrainingsWithExercises.one({
        id: trainingDto.id,
        userId: trainingDto.userId,
      });

      training
        .update({
          type: trainingDto.type,
          name: trainingDto.name,
          description: trainingDto.description,
        })
        .updatePostTrainingDuration(trainingDto.postTrainingDuration)
        .updateWormUpDuration(trainingDto.wormUpDuration)
        .updateExercises(exercisesDto);

      const updatedTraining = await this.trainingsRepo.update(
        {
          id: training.id,
          type: training.type,
          description: training.description,
          name: training.name,
          post_training_duration: training?.postTrainingDuration,
          worm_up_duration: training?.wormUpDuration,
        },
        { replace: true },
        transaction,
      );
      if (updatedTraining == null) {
        throw new InternalServerErrorException(`Failed to update training id: ${trainingDto.id}`);
      }

      await Promise.all(
        training.exercises.map(async (exercise) => {
          return await this.updateExercisesWithRepetitions.execute(
            {
              id: exercise.id,
              userId: training.userId,
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

      return training;
    });
  }
}

export { UpdateTrainingWithExercisesCommand, UpdateTrainingWithExercisesInput };
