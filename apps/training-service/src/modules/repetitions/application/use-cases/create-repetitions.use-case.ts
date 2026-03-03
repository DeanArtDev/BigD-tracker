import { DB } from '@infrastructure/types';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';
import { RepetitionRawData, REPETITIONS_REPOSITORY, RepetitionsRepository } from '../repetitions.repository';
import { RepetitionEntity } from '../../domain/repetition.entity';

interface CreateRepetitionInput {
  readonly userId?: number;
  readonly exerciseId: number;
  readonly targetCount: number;
  readonly targetWeight: string;
  readonly targetBreak: number;
  readonly position: number;
}

@Injectable()
export class CreateRepetitionsUseCase {
  constructor(
    @Inject(REPETITIONS_REPOSITORY)
    private readonly repetitionsRepo: RepetitionsRepository,
  ) {}

  async execute(dto: CreateRepetitionInput[], userId?: number, trx?: Transaction<DB>): Promise<RepetitionEntity[]> {
    const repetitionsDraft = dto.map(RepetitionEntity.create);

    return await this.repetitionsRepo.createMany(
      repetitionsDraft.map<RepetitionRawData['insertable']>((rep) => {
        return {
          user_id: userId,
          exercise_id: rep.exerciseId,
          target_count: rep.targetCount,
          target_weight: rep.targetWeight,
          target_break: rep.targetBreak,
          position: rep.position,
        };
      }),
      trx,
    );
  }
}
