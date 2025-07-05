import { GetExercisesWithRepetitionsQuery } from '@modules/exercises/application';
import { TrainingWithExercisesEntity } from '@modules/tranings/domain';
import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TRAININGS_REPOSITORY, TrainingsRepository } from '../../trainings.repository';
import { GetTrainingsQuery } from './get-trainings.query';

@Injectable()
export class GetTrainingsWithExercisesQuery {
  constructor(
    @Inject(TRAININGS_REPOSITORY)
    private readonly trainingsRepo: TrainingsRepository,
    private readonly getTrainingsQuery: GetTrainingsQuery,
    private readonly getExercisesWithRepetitions: GetExercisesWithRepetitionsQuery,
  ) {}

  async one(input: { id: number; userId: number }): Promise<TrainingWithExercisesEntity> {
    const training = await this.getTrainingsQuery.one({ id: input.id, userId: input.userId });
    const exercises = await this.getExercisesWithRepetitions.all({
      userId: input.userId,
      trainingId: input.id,
    });

    return TrainingWithExercisesEntity.restore(training).setExercises(exercises);
  }

  async getActive({ userId }: { userId: number }): Promise<TrainingWithExercisesEntity> {
    const training = await this.trainingsRepo.findActive();

    if (training == null) {
      throw new NotFoundException(`Active training is not found`);
    }
    if (training.userId !== userId) {
      throw new ForbiddenException('This is not yours training');
    }

    const exercises = await this.getExercisesWithRepetitions.all({
      userId: userId,
      trainingId: training.id,
    });

    return TrainingWithExercisesEntity.restore(training).setExercises(exercises);
  }
}
