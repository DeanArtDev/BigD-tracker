import { GetExercisesWithRepetitionsQuery } from '@/modules/exercises';
import { GetTrainingTemplatesQuery } from './get-training-templates.query';
import { Injectable } from '@nestjs/common';
import { KyselyUnitOfWork } from '@shared/core/uow';
import { TrainingTemplateWithExercisesEntity } from '../../../domain/entities';

@Injectable()
export class GetTrainingTemplateWithExercisesQuery {
  constructor(
    private readonly getTrainingTemplatesQuery: GetTrainingTemplatesQuery,

    private readonly getExercisesWithRepetitions: GetExercisesWithRepetitionsQuery,

    private readonly unitOfWork: KyselyUnitOfWork,
  ) {}

  async one(input: { id: number; userId?: number }): Promise<TrainingTemplateWithExercisesEntity> {
    return await this.unitOfWork.execute(async (transaction) => {
      const training = await this.getTrainingTemplatesQuery.one(
        { id: input.id, userId: input.userId },
        transaction,
      );
      const exercises = await this.getExercisesWithRepetitions.all({
        userId: input.userId,
        templateId: input.id,
      });

      return TrainingTemplateWithExercisesEntity.restore(training).setExercises(exercises);
    });
  }
}
