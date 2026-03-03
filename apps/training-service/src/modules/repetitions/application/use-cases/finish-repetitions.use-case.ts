import { KyselyUnitOfWork } from '@big-d/api-utils';
import { Database, DATABASE_CONNECTION } from '@big-d/database';
import { DB } from '@infrastructure/types';
import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Transaction } from 'kysely';
import { RepetitionEntity } from '../../domain/repetition.entity';
import { RepetitionFinishType, REPETITIONS_REPOSITORY, RepetitionsRepository } from '../repetitions.repository';

interface SetFactInput {
  readonly userId: number;
  readonly repetitionId: number;
  readonly factCount: number;
  readonly factWeight: string;
  readonly description?: string;
  readonly finishType: RepetitionFinishType;
}

interface FinishRepetitionInput {
  readonly userId: number;
  readonly repetitionId: number;
  readonly factBreak: number;
}

@Injectable()
export class FinishRepetitionsUseCase extends KyselyUnitOfWork<DB> {
  async setDuration(
    { userId, factBreak, repetitionId }: FinishRepetitionInput,
    trx?: Transaction<DB>,
  ): Promise<RepetitionEntity> {
    return await this.runTransaction(async (transaction) => {
      const restoredRepetition = await this.#findRepo({ userId, repetitionId }, transaction);

      restoredRepetition.setDuration({ factBreak });

      const updatedRepetition = await this.repetitionsRepo.update(
        {
          id: repetitionId,
          fact_break: factBreak,
        },
        transaction,
      );

      if (updatedRepetition == null) {
        throw new InternalServerErrorException(`Failed to update repetition with id: ${repetitionId}`);
      }

      return updatedRepetition;
    }, trx);
  }

  constructor(
    @Inject(REPETITIONS_REPOSITORY)
    private readonly repetitionsRepo: RepetitionsRepository,
    @Inject(DATABASE_CONNECTION) private readonly database: Database<DB>,
  ) {
    super(database);
  }

  async setFact(
    { userId, factWeight, factCount, repetitionId, finishType, description }: SetFactInput,
    trx?: Transaction<DB>,
  ): Promise<RepetitionEntity> {
    return await this.runTransaction(async (transaction) => {
      const restoredRepetition = await this.#findRepo({ userId, repetitionId: repetitionId }, transaction);

      restoredRepetition.setFact({
        factCount: factCount,
        factWeight: factWeight,
        finishType: finishType,
        description: description,
      });

      const updatedRepetition = await this.repetitionsRepo.update(
        {
          id: repetitionId,
          fact_count: restoredRepetition.factCount,
          fact_weight: restoredRepetition.factWeight,
          finish_type: restoredRepetition.finishType,
          description: restoredRepetition.description,
        },
        transaction,
      );

      if (updatedRepetition == null) {
        throw new InternalServerErrorException(`Failed to update repetition with id: ${repetitionId}`);
      }

      return updatedRepetition;
    }, trx);
  }

  async #findRepo(data: { userId: number; repetitionId: number }, trx?: Transaction<DB>): Promise<RepetitionEntity> {
    const restoredRepetition = await this.repetitionsRepo.findOneById(data.repetitionId, trx);

    if (restoredRepetition == null) {
      throw new NotFoundException(`Repetition with id ${data.repetitionId} not found`);
    }

    if (restoredRepetition.userId !== data.userId) {
      throw new InternalServerErrorException(`You cannot finish not your repetition, id:${data.repetitionId}`);
    }

    return restoredRepetition;
  }
}
