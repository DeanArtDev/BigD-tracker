import { TrainingEntity } from '@/tranings/entities/training.entity';
import { TrainingsMapper } from '@/tranings/trainings.mapper';
import { TrainingsRepository } from '@/tranings/trainings.repository';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { TrainingAggregationEntity } from './entities/training-aggregation.entity';
import { TrainingAggregationRepository } from './training-aggregation.repository';
import { TrainingsAggregationMapper } from './trainings-aggregation.mapper';

@Injectable()
export class TrainingsAggregationService {
  constructor(
    private readonly trainingsRepository: TrainingsRepository,
    private readonly trainingsMapper: TrainingsMapper,
    private readonly trainingAggregationMapper: TrainingsAggregationMapper,
    private readonly trainingAggregationRepository: TrainingAggregationRepository,
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

  async setStartDataAtTraining(data: {
    startDate: string;
    trainingId: number;
  }): Promise<TrainingEntity> {
    await this.findTrainingById({ id: data.trainingId });

    const rawTraining = await this.trainingsRepository.update({
      id: data.trainingId,
      start_date: data.startDate,
    });
    if (rawTraining == null) {
      throw new InternalServerErrorException('Failed to assign start_date to training');
    }
    return this.trainingsMapper.fromPersistenceToEntity(rawTraining);
  }

  async deleteTrainingAggregation(trainingId: number): Promise<void> {
    const isDeleted = await this.trainingsRepository.delete({ id: trainingId });
    if (!isDeleted) {
      throw new NotFoundException(`Training with id ${trainingId} not found`);
    }
  }

  private async findTrainingById(data: { id: number }) {
    const rowTraining = await this.trainingsRepository.findOneById({ id: data.id });
    if (rowTraining == null) {
      throw new NotFoundException('Training is not found');
    }
    return rowTraining;
  }
}
