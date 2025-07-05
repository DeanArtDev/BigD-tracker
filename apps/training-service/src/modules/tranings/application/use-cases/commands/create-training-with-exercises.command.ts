import { CreateExercisesWithRepetitionsCommand } from '@/modules/exercises/application/use-cases';
import { RepetitionEntity } from '@/modules/repetitions';
import { ExerciseType, TrainingType } from '@big-d/api-contracts';
import { KyselyUnitOfWork } from '@big-d/api-utils';
import { Database, DATABASE_CONNECTION, DB } from '@big-d/database';
import { ExerciseWithRepetitionsEntity } from '@modules/exercises/domain';
import { TrainingWithExercisesEntity } from '@modules/tranings/domain';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { TRAININGS_REPOSITORY, TrainingsRepository } from '../../trainings.repository';

interface CreateTrainingWithExercisesInput {
  readonly userId: number;
  readonly name: string;
  readonly type: TrainingType;
  readonly startDate: string;
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
class CreateTrainingWithExercisesCommand extends KyselyUnitOfWork<DB> {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly database: Database<DB>,
    @Inject(TRAININGS_REPOSITORY) private readonly trainingsRepo: TrainingsRepository,
    private readonly createExercisesWithRepetitions: CreateExercisesWithRepetitionsCommand,
  ) {
    super(database);
  }

  async execute(input: CreateTrainingWithExercisesInput): Promise<TrainingWithExercisesEntity> {
    const { exercises, ...training } = input;

    return await this.runTransaction(async (transaction) => {
      const draftTraining = TrainingWithExercisesEntity.create(training);

      draftTraining.setExercises(
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
            .assignToTraining({ trainingId: draftTraining.id });
        }),
      );

      const newTraining = await this.trainingsRepo.create(
        {
          user_id: draftTraining.userId,
          type: draftTraining.type,
          description: draftTraining.description,
          name: draftTraining.name,
          post_training_duration: draftTraining?.postTrainingDuration,
          start_date: draftTraining.startDate,
          worm_up_duration: draftTraining?.wormUpDuration,
        },
        transaction,
      );
      if (newTraining == null) {
        throw new InternalServerErrorException('Failed to create training');
      }

      const newExercises = await Promise.all(
        draftTraining.exercises.map(async (exercise) => {
          return await this.createExercisesWithRepetitions.execute(
            {
              position: exercise.position,
              userId: training.userId,
              name: exercise.name,
              type: exercise.type,
              description: exercise.description,
              exampleUrl: exercise.exampleUrl,
              trainingId: newTraining.id,
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

      return TrainingWithExercisesEntity.restore(newTraining).setExercises(newExercises);
    });
  }
}

export { CreateTrainingWithExercisesCommand, CreateTrainingWithExercisesInput };
