import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { RepetitionEntity } from '../../../domain/repetition.entity';
import {
  RepetitionFinishType,
  REPETITIONS_REPOSITORY,
  RepetitionsRepository,
} from '../../repetitions.repository';

/*TODO:
 *  1. проверить есть ли эти повторения в тренировке, не закончилась ли она сделать это в enitity Training
 *  2. когда будет честное обновление заиспользовать его тут, так как сейчас обновление через перезапись
 * */
interface FinishRepetitionsInput {
  readonly userId: number;
  readonly exerciseId: number;
  readonly repetitions: {
    readonly id: number;
    readonly factCount: number;
    readonly factWeight: string;
    readonly description?: string;
    readonly factBreak: number;
    readonly finishType: RepetitionFinishType;
  }[];
}

@Injectable()
export class FinishRepetitionsService {
  constructor(
    @Inject(REPETITIONS_REPOSITORY)
    private readonly repetitionsRepo: RepetitionsRepository,
  ) {}

  async execute({
    userId,
    exerciseId,
    repetitions,
  }: FinishRepetitionsInput): Promise<RepetitionEntity[]> {
    const draftedRepetitions = await this.repetitionsRepo.findAllByFilters({
      userId,
      exerciseId,
    });
    if (draftedRepetitions.some((r) => r.userId !== userId)) {
      throw new InternalServerErrorException(
        `You cannot finish not your repetitions, {${repetitions.map((i) => i.id).join(', ')}}`,
      );
    }

    return await Promise.all(
      repetitions.map(async (repetition) => {
        const updatedRepetition = await this.repetitionsRepo.update({
          id: repetition.id,
          fact_count: repetition.factCount,
          fact_weight: repetition.factWeight,
          fact_break: repetition.factBreak,
          finish_type: repetition.finishType,
          description: repetition.description,
        });

        if (updatedRepetition == null) {
          throw new InternalServerErrorException(
            `Failed to update repetition with id: ${repetition.id}`,
          );
        }

        return updatedRepetition;
      }),
    );
  }
}
