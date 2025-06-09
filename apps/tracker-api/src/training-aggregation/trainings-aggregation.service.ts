import { CreateRepetitionsDto } from '@/repetitions/dto/create-repetitions.dto';
import { RepetitionEntity } from '@/repetitions/repetitions.entity';
import { RepetitionMapper } from '@/repetitions/repetitions.mapper';
import { RepetitionsRepository } from '@/repetitions/repetitions.repository';
import { TrainingEntity } from '@/tranings/entities/training.entity';
import { TrainingsMapper } from '@/tranings/trainings.mapper';
import { TrainingsRepository } from '@/tranings/trainings.repository';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TrainingAggregationEntity } from './entities/training-aggregation.entity';
import { TrainingAggregationRepository } from './training-aggregation.repository';
import { TrainingsAggregationMapper } from './trainings-aggregation.mapper';

@Injectable()
export class TrainingsAggregationService {
  constructor(
    private readonly trainingsMapper: TrainingsMapper,
    private readonly trainingsRepository: TrainingsRepository,

    private readonly trainingAggregationMapper: TrainingsAggregationMapper,
    private readonly trainingAggregationRepository: TrainingAggregationRepository,

    private readonly repetitionMapper: RepetitionMapper,
    private readonly repetitionsRepository: RepetitionsRepository,
  ) {}

  async getTrainings(
    userId: number,
    filters: { to?: string; from?: string },
  ): Promise<TrainingAggregationEntity[]> {
    const raws = await this.trainingAggregationRepository.findAllTrainingAggregation(
      userId,
      filters,
    );
    if (raws == null) return [];

    const buffer: TrainingAggregationEntity[] = [];
    for (const raw of raws) {
      const trainingEntity = this.trainingAggregationMapper.fromPersistenceToEntity({
        rawTraining: raw.trainingTemplate,
        rawExercises: raw.exercises,
      });

      for (const exercise of trainingEntity.exercises) {
        const rawRepetitions = await this.repetitionsRepository.findAllByFilters({
          id: exercise.id,
          userId: exercise.userId,
        });
        exercise.addRepetitions(rawRepetitions.map(this.repetitionMapper.fromPersistenceToEntity));
      }

      buffer.push(trainingEntity);
    }

    return buffer;
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

  async deleteTrainingAggregation(trainingId: number, userId: number): Promise<void> {
    const existedTraining = await this.trainingsRepository.findOneById({ id: trainingId });
    if (existedTraining == null) {
      throw new NotFoundException(`Training with id ${trainingId} not found`);
    }

    if (userId !== existedTraining.user_id) {
      throw new ForbiddenException('Delete can only your own training');
    }

    await this.trainingsRepository.delete({ id: trainingId });
  }

  private async findTrainingById(data: { id: number }) {
    const rowTraining = await this.trainingsRepository.findOneById({ id: data.id });
    if (rowTraining == null) {
      throw new NotFoundException('Training is not found');
    }
    return rowTraining;
  }

  async createRepetitions(
    userId: number,
    trainingId: number,
    exerciseId: number,
    data: CreateRepetitionsDto[],
  ): Promise<RepetitionEntity[]> {
    const createRepetitionRawData: Parameters<typeof this.repetitionsRepository.createMany>[0] = [];

    for (const repetition of data) {
      const repetitionEntity = this.repetitionMapper.fromCreateDtoToEntity(repetition);
      createRepetitionRawData.push({
        user_id: userId,
        training_id: trainingId,
        exercises_id: exerciseId,
        target_break: repetitionEntity.targetBreak,
        target_count: repetitionEntity.targetCount,
        target_weight: repetitionEntity.targetWeight,
      });
    }

    try {
      const raws = await this.repetitionsRepository.createMany(createRepetitionRawData);
      return raws.map(this.repetitionMapper.fromPersistenceToEntity);
    } catch {
      throw new InternalServerErrorException(
        `Failed to create repetitions ${JSON.stringify(
          {
            user_id: userId,
            exercises_id: exerciseId,
            training_id: trainingId,
          },
          null,
          2,
        )}`,
      );
    }
  }
}
