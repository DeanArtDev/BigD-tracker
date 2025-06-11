import { Inject, Injectable } from '@nestjs/common';
import {
  RepetitionRawData,
  REPETITIONS_REPOSITORY,
  RepetitionsRepository,
} from '../repetitions.repository';
import { CreateRepetitionDto } from '../dto/create-repetition.dto';
import { RepetitionEntity } from '../../domain/repetition.entity';

@Injectable()
export class CreateRepetitionsService {
  constructor(
    @Inject(REPETITIONS_REPOSITORY)
    private readonly repetitionsRepo: RepetitionsRepository,
  ) {}

  async execute(dto: CreateRepetitionDto[], userId?: number): Promise<RepetitionEntity[]> {
    const repetitionsDraft = dto.map(RepetitionEntity.create);

    return await this.repetitionsRepo.createMany(
      repetitionsDraft.map<RepetitionRawData['insertable']>((repetition) => {
        return {
          user_id: userId,
          exercises_id: repetition.exerciseId,
          target_count: repetition.targetCount,
          target_weight: repetition.targetWeight,
          target_break: repetition.targetBreak,
        };
      }),
    );
  }
}
