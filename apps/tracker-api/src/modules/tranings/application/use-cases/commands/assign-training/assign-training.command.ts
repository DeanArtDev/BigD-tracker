import { GetTrainingsQuery } from '../../queries/get-trainings.query';
import { Inject, Injectable } from '@nestjs/common';
import { KyselyUnitOfWork } from '@shared/core/uow';
import { TRAININGS_REPOSITORY, TrainingsRepository } from '../../../trainings.repository';

type AssignTrainingInput = {
  readonly id: number;
  readonly startDate: string;
}[];

@Injectable()
class AssignTrainingCommand {
  constructor(
    @Inject(TRAININGS_REPOSITORY)
    private readonly trainingsRepo: TrainingsRepository,

    private readonly unitOfWork: KyselyUnitOfWork,

    private readonly getTrainingsQuery: GetTrainingsQuery,
  ) {}

  async execute(input: AssignTrainingInput, userId: number): Promise<void> {
    await this.unitOfWork.execute(async (transaction) => {
      await Promise.all(
        input.map(async ({ id, startDate }) => {
          await this.getTrainingsQuery.one({ id, userId });
          await this.trainingsRepo.update({ id, start_date: startDate }, undefined, transaction);
        }),
      );
    });
  }
}

export { AssignTrainingCommand };
