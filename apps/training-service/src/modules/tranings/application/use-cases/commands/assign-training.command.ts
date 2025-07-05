import { Inject, Injectable } from '@nestjs/common';
import { TRAININGS_REPOSITORY, TrainingsRepository } from '../../trainings.repository';
import { GetTrainingsQuery } from '../queries/get-trainings.query';

type AssignTrainingInput = {
  readonly id: number;
  readonly startDate: string;
}[];

@Injectable()
class AssignTrainingCommand {
  constructor(
    @Inject(TRAININGS_REPOSITORY) private readonly trainingsRepo: TrainingsRepository,
    private readonly getTrainingsQuery: GetTrainingsQuery,
  ) {}

  async execute(input: AssignTrainingInput, userId: number): Promise<void> {
    await Promise.all(
      input.map(async ({ id, startDate }) => {
        await this.getTrainingsQuery.one({ id, userId });
        await this.trainingsRepo.update({ id, start_date: startDate });
      }),
    );
  }
}

export { AssignTrainingCommand };
