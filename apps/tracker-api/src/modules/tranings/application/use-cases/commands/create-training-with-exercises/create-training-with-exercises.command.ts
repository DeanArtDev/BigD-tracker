import {
  CreateExercisesWithRepetitionsCommand,
  ExerciseType,
  ExerciseWithRepetitionsEntity,
} from '@/modules/exercises';
import { RepetitionEntity } from '@/modules/repetitions';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { KyselyUnitOfWork } from '@shared/core/uow';
import { TrainingWithExercisesEntity } from '../../../../domain/entities/training-with-exercises.entity';
import {
  TRAININGS_REPOSITORY,
  TrainingsRepository,
  TrainingType,
} from '../../../trainings.repository';

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
class CreateTrainingWithExercisesCommand {
  constructor(
    @Inject(TRAININGS_REPOSITORY)
    private readonly trainingsRepo: TrainingsRepository,

    private readonly unitOfWork: KyselyUnitOfWork,
    private readonly createExercisesWithRepetitions: CreateExercisesWithRepetitionsCommand,
  ) {}

  async execute(input: CreateTrainingWithExercisesInput): Promise<TrainingWithExercisesEntity> {
    const { exercises, ...training } = input;

    return await this.unitOfWork.execute(async (transaction) => {
      const draftTraining = TrainingWithExercisesEntity.create(training);

      draftTraining.setExercises(
        exercises.map((exercise) =>
          ExerciseWithRepetitionsEntity.create(exercise)
            .setRepetitions(exercise.repetitions.map(RepetitionEntity.create))
            .assignToTraining({ trainingId: draftTraining.id }),
        ),
      );

      const newTraining = await this.trainingsRepo.create(
        {
          user_id: draftTraining.userId,
          type: draftTraining.type,
          description: draftTraining.description,
          name: draftTraining.name,
          post_training_duration: training?.postTrainingDuration,
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
