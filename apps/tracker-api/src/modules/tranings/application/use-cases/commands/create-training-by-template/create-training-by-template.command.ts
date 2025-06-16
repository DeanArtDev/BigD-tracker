import { CreateExercisesWithRepetitionsCommand } from '@/modules/exercises';
import { GetTrainingTemplateWithExercisesQuery } from '@/modules/traning-templates/application';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { KyselyUnitOfWork } from '@shared/core/uow';
import { TrainingWithExercisesEntity } from '../../../../domain/entities/training-with-exercises.entity';
import { TRAININGS_REPOSITORY, TrainingsRepository } from '../../../trainings.repository';

interface CreateTrainingByTemplateInput {
  readonly templateId: number;
  readonly startDate: string;
  readonly userId: number;
}

@Injectable()
class CreateTrainingByTemplateCommand {
  constructor(
    @Inject(TRAININGS_REPOSITORY)
    private readonly trainingsRepo: TrainingsRepository,

    private readonly unitOfWork: KyselyUnitOfWork,

    private readonly createExercisesWithRepetitions: CreateExercisesWithRepetitionsCommand,

    private readonly getTrainingTemplateWithExercises: GetTrainingTemplateWithExercisesQuery,
  ) {}

  async execute(input: CreateTrainingByTemplateInput): Promise<TrainingWithExercisesEntity> {
    const { templateId, userId, startDate } = input;

    return await this.unitOfWork.execute(async (transaction) => {
      const template = await this.getTrainingTemplateWithExercises.one({ id: templateId, userId });

      const newTraining = await this.trainingsRepo.create(
        {
          user_id: userId,
          type: template.type,
          description: template.description,
          name: template.name,
          post_training_duration: template?.postTrainingDuration,
          start_date: startDate,
          worm_up_duration: template?.wormUpDuration,
        },
        transaction,
      );
      if (newTraining == null) {
        throw new InternalServerErrorException(
          `Failed to create training by template, templateId: ${templateId}`,
        );
      }

      const newExercises = await Promise.all(
        template.exercises.map(async (exercise) => {
          return await this.createExercisesWithRepetitions.execute(
            {
              userId: newTraining.userId,
              name: exercise.name,
              type: exercise.type,
              description: exercise.description,
              exampleUrl: exercise.exampleUrl,
              trainingId: newTraining.id,
              repetitions: exercise.repetitions.map((repetition) => {
                return {
                  userId: newTraining.userId,
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

export { CreateTrainingByTemplateCommand, CreateTrainingByTemplateInput };
