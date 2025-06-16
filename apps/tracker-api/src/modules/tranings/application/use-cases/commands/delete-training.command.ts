import { TRAININGS_REPOSITORY, TrainingsRepository } from '../../trainings.repository';
import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { KyselyUnitOfWork } from '@shared/core/uow';

@Injectable()
class DeleteTrainingCommand {
  constructor(
    @Inject(TRAININGS_REPOSITORY)
    private readonly trainingsRepo: TrainingsRepository,

    private readonly unitOfWork: KyselyUnitOfWork,
  ) {}

  async execute(trainingId: number, userId: number): Promise<void> {
    return await this.unitOfWork.execute(async (transaction) => {
      const existedTraining = await this.trainingsRepo.findOneById({ id: trainingId }, transaction);
      if (existedTraining == null) {
        throw new NotFoundException(`Training with id ${trainingId} not found`);
      }

      if (userId !== existedTraining.userId) {
        throw new ForbiddenException('Delete can only your own training');
      }

      await this.trainingsRepo.delete({ id: trainingId }, transaction);
    });
  }
}

export { DeleteTrainingCommand };
