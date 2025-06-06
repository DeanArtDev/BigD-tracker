import { TrainingAggregationEntity } from '@/training-aggregation/entities/training-aggregation.entity';
import { TrainingAggregationRepository } from '@/training-aggregation/training-aggregation.repository';
import { TrainingsRepository } from '@/tranings/trainings.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { TrainingsAggregationMapper } from './trainings-aggregation.mapper';

@Injectable()
export class TrainingsAggregationService {
  constructor(
    readonly trainingsRepository: TrainingsRepository,
    readonly trainingAggregationMapper: TrainingsAggregationMapper,
    readonly trainingAggregationRepository: TrainingAggregationRepository,
  ) {}

  async getTrainings(
    userId: number,
    filters: { to?: string; from?: string },
  ): Promise<TrainingAggregationEntity[]> {
    const raw = await this.trainingAggregationRepository.findAllTrainingAggregation(
      userId,
      filters,
    );
    if (raw == null) return [];

    return raw.map((item) =>
      this.trainingAggregationMapper.fromPersistenceToEntity({
        rawTraining: item.trainingTemplate,
        rawExercises: item.exercises,
      }),
    );
  }

  async deleteTrainingAggregation(trainingId: number): Promise<void> {
    const isDeleted = await this.trainingsRepository.delete({ id: trainingId });
    if (!isDeleted) {
      throw new NotFoundException(`Training with id ${trainingId} not found`);
    }
  }
}
