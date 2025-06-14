import { GetExercisesWithRepetitionsQuery } from '@/modules/exercises';
import { Injectable } from '@nestjs/common';
import { KyselyUnitOfWork } from '@shared/core/uow';
import { TrainingWithExercisesEntity } from '../../../domain/entities/training-with-exercises.entity';
import { GetTrainingsQuery } from './get-trainings.query';

@Injectable()
export class GetTrainingsWithExercisesQuery {
  constructor(
    private readonly getTrainingsQuery: GetTrainingsQuery,

    private readonly getExercisesWithRepetitions: GetExercisesWithRepetitionsQuery,

    private readonly unitOfWork: KyselyUnitOfWork,
  ) {}

  async one(input: { id: number; userId: number }): Promise<TrainingWithExercisesEntity> {
    return await this.unitOfWork.execute(async (transaction) => {
      const training = await this.getTrainingsQuery.one(
        { id: input.id, userId: input.userId },
        transaction,
      );
      const exercises = await this.getExercisesWithRepetitions.all({
        userId: input.userId,
        trainingId: input.id,
      });

      return TrainingWithExercisesEntity.restore(training).setExercises(exercises);
    });
  }
}
