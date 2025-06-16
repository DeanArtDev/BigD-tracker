import { DB } from '@/infrastructure/db';
import { TrainingEntity } from '@/modules/tranings/domain/entities/training.entity';
import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Transaction } from 'kysely';
import { TRAININGS_REPOSITORY, TrainingsRepository } from '../../trainings.repository';

@Injectable()
export class GetTrainingsQuery {
  constructor(
    @Inject(TRAININGS_REPOSITORY)
    private readonly trainingsRepo: TrainingsRepository,
  ) {}

  async all(
    input: { userId: number; from?: string; to?: string },
    trx?: Transaction<DB>,
  ): Promise<TrainingEntity[]> {
    return await this.trainingsRepo.find(
      { userId: input.userId, from: input.from, to: input.to },
      trx,
    );
  }

  async one(
    input: { id: number; userId?: number },
    trx?: Transaction<DB>,
  ): Promise<TrainingEntity> {
    const training = await this.trainingsRepo.findOneById({ id: input.id }, trx);
    if (training == null) {
      throw new NotFoundException(`Training with id ${input.id} not found`);
    }
    if (training.userId != null && training.userId !== input.userId) {
      throw new ForbiddenException('This is not yours training with id ' + input.id);
    }
    return training;
  }
}
