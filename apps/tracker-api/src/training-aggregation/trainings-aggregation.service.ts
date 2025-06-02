import { Injectable, NotFoundException } from '@nestjs/common';
import { ExercisesRepository } from '@/exercises/exercises.repository';
import { TrainingsRepository } from '@/tranings/trainings.repository';
import { TrainingsAggregationMapper } from './trainings-aggregation.mapper';
import { TrainingAggregationEntity } from './entities/training-aggregation.entity';

@Injectable()
export class TrainingsAggregationService {
  constructor(
    readonly trainingsRepository: TrainingsRepository,
    readonly exercisesRepository: ExercisesRepository,
    readonly trainingAggregationMapper: TrainingsAggregationMapper,
  ) {}

  async getTrainings(filters: { userId: number; to?: string; from?: string }) {
    const buffer: TrainingAggregationEntity[] = [];

    const rawTrainings = await this.trainingsRepository.findByRangeForUser(filters);
    for (const rawTraining of rawTrainings) {
      const rawExercises = await this.exercisesRepository.findExercisesByFilters({
        trainingId: rawTraining.id,
        userId: rawTraining.user_id,
      });
      const trainingAggregation = this.trainingAggregationMapper.fromRaw({
        rawTraining,
        rawExercises,
      });
      buffer.push(trainingAggregation);
    }

    return buffer;
  }

  async deleteTrainingAggregation(trainingId: number): Promise<void> {
    const isDeleted = await this.trainingsRepository.delete({ id: trainingId });
    if (!isDeleted) {
      throw new NotFoundException(`Training with id ${trainingId} not found`);
    }
  }
}
