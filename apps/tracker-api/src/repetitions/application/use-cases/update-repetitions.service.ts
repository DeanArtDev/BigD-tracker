import { Inject, Injectable } from '@nestjs/common';
import { RepetitionEntity } from '../../domain/repetition.entity';
import {
  RepetitionRawData,
  REPETITIONS_REPOSITORY,
  RepetitionsRepository,
} from '../repetitions.repository';
import { DeleteRepetitionsService } from './delete-repetitions.service';

interface UpdateRepetitionsInput {
  readonly userId: number;
  readonly exerciseId: number;
  readonly repetitions: {
    readonly targetCount: number;
    readonly targetWeight: string;
    readonly targetBreak: number;
    readonly description?: string;
  }[];
}

/*TODO:
 *  сделать полноценное обновление без удаления и пересоздания
 * */
@Injectable()
export class UpdateRepetitionsService {
  constructor(
    @Inject(REPETITIONS_REPOSITORY)
    private readonly repetitionsRepo: RepetitionsRepository,
    private readonly deleteRepetitionsService: DeleteRepetitionsService,
  ) {}

  async execute({
    repetitions,
    userId,
    exerciseId,
  }: UpdateRepetitionsInput): Promise<RepetitionEntity[]> {
    await this.deleteRepetitionsService.execute({
      userId,
      exerciseId,
    });

    return await this.repetitionsRepo.createMany(
      repetitions.map<RepetitionRawData['insertable']>((repetition) => {
        return {
          exercises_id: exerciseId,
          description: repetition.description,
          target_break: repetition.targetBreak,
          target_count: repetition.targetCount,
          target_weight: repetition.targetWeight,
          user_id: userId,
        };
      }),
    );
  }
}
