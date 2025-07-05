import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TRAININGS_REPOSITORY, TrainingsRepository } from '../../trainings.repository';

@Injectable()
class DeleteTrainingCommand {
  constructor(
    @Inject(TRAININGS_REPOSITORY)
    private readonly trainingsRepo: TrainingsRepository,
  ) {}

  async execute(trainingId: number, userId: number): Promise<void> {
    const existedTraining = await this.trainingsRepo.findOneById({ id: trainingId });
    if (existedTraining == null) {
      throw new NotFoundException(`Training with id ${trainingId} not found`);
    }

    if (userId !== existedTraining.userId) {
      throw new ForbiddenException('Delete can only your own training');
    }

    await this.trainingsRepo.delete({ id: trainingId });
  }
}

export { DeleteTrainingCommand };
