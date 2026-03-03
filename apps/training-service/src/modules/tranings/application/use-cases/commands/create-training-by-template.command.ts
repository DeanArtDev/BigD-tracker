import { GetTrainingTemplatesQuery } from '@/modules/traning-templates/application/use-cases';
import { KyselyUnitOfWork } from '@big-d/api-utils';
import { Database, DATABASE_CONNECTION } from '@big-d/database';
import { DB } from '@infrastructure/types';
import { CreateExercisesWithRepetitionsCommand } from '@modules/exercises/application/use-cases';
import { TrainingWithExercisesEntity } from '@modules/tranings/domain';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { TRAININGS_REPOSITORY, TrainingsRepository } from '../../trainings.repository';

interface CreateTrainingByTemplateInput {
  readonly items: { readonly templateId: number; readonly startDate: string }[];
  readonly userId: number;
}

@Injectable()
class CreateTrainingByTemplateCommand extends KyselyUnitOfWork<DB> {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly database: Database<DB>,
    @Inject(TRAININGS_REPOSITORY) private readonly trainingsRepo: TrainingsRepository,
    private readonly createExercisesWithRepetitions: CreateExercisesWithRepetitionsCommand,
    private readonly getTrainingTemplatesQuery: GetTrainingTemplatesQuery,
  ) {
    super(database);
  }

  async execute(input: CreateTrainingByTemplateInput): Promise<TrainingWithExercisesEntity[]> {
    const { items, userId } = input;

    return await this.runTransaction(async (transaction) => {
      const buffer: TrainingWithExercisesEntity[] = [];

      for (const { templateId, startDate } of items) {
        const template = await this.getTrainingTemplatesQuery.oneWithExercises({
          id: templateId,
          userId,
        });

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
          throw new InternalServerErrorException(`Failed to create training by template, templateId: ${templateId}`);
        }

        const newExercises = await Promise.all(
          template.exercises.map(async (exercise, index) => {
            return await this.createExercisesWithRepetitions.execute(
              {
                position: index,
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

        buffer.push(TrainingWithExercisesEntity.restore(newTraining).setExercises(newExercises));
      }

      return buffer;
    });
  }
}

export { CreateTrainingByTemplateCommand, CreateTrainingByTemplateInput };
