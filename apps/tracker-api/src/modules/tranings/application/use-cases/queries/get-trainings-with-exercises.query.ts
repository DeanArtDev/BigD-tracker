import { DB } from '@/infrastructure/db';
import { GetExercisesWithRepetitionsQuery } from '@/modules/exercises';
import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { KyselyUnitOfWork } from '@shared/core/uow';
import { Transaction } from 'kysely';
import { TrainingWithExercisesEntity } from '../../../domain/entities/training-with-exercises.entity';
import { TRAININGS_REPOSITORY, TrainingsRepository } from '../../trainings.repository';
import { GetTrainingsQuery } from './get-trainings.query';

@Injectable()
export class GetTrainingsWithExercisesQuery {
  constructor(
    @Inject(TRAININGS_REPOSITORY)
    private readonly trainingsRepo: TrainingsRepository,

    private readonly getTrainingsQuery: GetTrainingsQuery,

    private readonly getExercisesWithRepetitions: GetExercisesWithRepetitionsQuery,

    private readonly unitOfWork: KyselyUnitOfWork,
  ) {}

  async one(
    input: { id: number; userId: number },
    trx?: Transaction<DB>,
  ): Promise<TrainingWithExercisesEntity> {
    return await this.unitOfWork.useTransaction(trx).execute(async (transaction) => {
      const training = await this.getTrainingsQuery.one(
        { id: input.id, userId: input.userId },
        transaction,
      );
      const exercises = await this.getExercisesWithRepetitions.all(
        {
          userId: input.userId,
          trainingId: input.id,
        },
        transaction,
      );

      return TrainingWithExercisesEntity.restore(training).setExercises(exercises);
    });
  }

  async getActive({ userId }: { userId: number }): Promise<TrainingWithExercisesEntity> {
    return await this.unitOfWork.execute(async (transaction) => {
      const training = await this.trainingsRepo.findActive(transaction);

      if (training == null) {
        throw new NotFoundException(`Active training is not found`);
      }
      if (training.userId !== userId) {
        throw new ForbiddenException('This is not yours training');
      }

      const exercises = await this.getExercisesWithRepetitions.all(
        {
          userId: userId,
          trainingId: training.id,
        },
        transaction,
      );

      return TrainingWithExercisesEntity.restore(training).setExercises(exercises);
    });
  }
}
