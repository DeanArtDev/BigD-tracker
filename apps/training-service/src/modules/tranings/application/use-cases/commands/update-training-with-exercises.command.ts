import { ExerciseType, TrainingType } from '@big-d/api-contracts';
import { KyselyUnitOfWork } from '@big-d/api-utils';
import { Database, DATABASE_CONNECTION, DB } from '@big-d/database';
import { UpdateExercisesWithRepetitionsCommand } from '@modules/exercises/application';
import { TrainingWithExercisesEntity } from '@modules/tranings/domain';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { TRAININGS_REPOSITORY, TrainingsRepository } from '../../trainings.repository';
import { GetTrainingsWithExercisesQuery } from '../queries/get-trainings-with-exercises.query';

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
      readonly id?: number;
      readonly targetCount: number;
      readonly targetWeight: string;
      readonly targetBreak: number;
      readonly description?: string;
    }[];
  }[];
}

@Injectable()
class UpdateTrainingWithExercisesCommand extends KyselyUnitOfWork<DB> {
  constructor(
    @Inject(TRAININGS_REPOSITORY) private readonly trainingsRepo: TrainingsRepository,
    @Inject(DATABASE_CONNECTION) private readonly database: Database<DB>,

    private readonly getTrainingsWithExercises: GetTrainingsWithExercisesQuery,
    private readonly updateExercisesWithRepetitions: UpdateExercisesWithRepetitionsCommand,
  ) {
    super(database);
  }

  async execute(input: UpdateTrainingWithExercisesInput): Promise<TrainingWithExercisesEntity> {
    const { exercises: exercisesDto, ...trainingDto } = input;

    return await this.runTransaction(async (transaction) => {
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
              position: exercise.position,
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
