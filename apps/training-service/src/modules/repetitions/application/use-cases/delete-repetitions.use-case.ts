import { DB } from '@infrastructure/types';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';
import { REPETITIONS_REPOSITORY, RepetitionsRepository } from '../repetitions.repository';

@Injectable()
export class DeleteRepetitionsUseCase {
  constructor(
    @Inject(REPETITIONS_REPOSITORY)
    private readonly repetitionsRepo: RepetitionsRepository,
  ) {}

  async execute(
    input: { exerciseId: number; userId: number },
    trx?: Transaction<DB>,
  ): Promise<number> {
    const currentRepetitions = await this.repetitionsRepo.findAllByFilters(input);
    if (currentRepetitions.some((repetition) => repetition.userId !== input.userId)) {
      throw new ForbiddenException('Cannot delete not your repetitions');
    }
    return await this.repetitionsRepo.deleteByExerciseIds([input.exerciseId], trx);
  }
}
