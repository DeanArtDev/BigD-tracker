import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ExerciseEntity } from '@/exercises/entity/exercise.entity';
import { ExercisesMapper } from '@/exercises/exercise.mapper';
import { ExercisesRepository } from '@/exercises/exercises.repository';
import { TrainingsRepository } from '@/tranings/trainings.repository';
import { TrainingAggregationEntity } from '../../entities/training-aggregation.entity';
import { TrainingsAggregationMapper } from '../../trainings-aggregation.mapper';
import {
  UpdateTrainingAggregationExercise,
  UpdateTrainingAggregationRequestData,
} from './update-training-aggregation.dto';

@Injectable()
export class UpdateTrainingAggregationUseCase {
  constructor(
    private readonly trainingsRepository: TrainingsRepository,
    private readonly exerciseRepository: ExercisesRepository,
    private readonly trainingsAggregationMapper: TrainingsAggregationMapper,
    private readonly exercisesMapper: ExercisesMapper,
  ) {}

  async execute(
    userId: number,
    dto: UpdateTrainingAggregationRequestData[],
  ): Promise<TrainingAggregationEntity[]> {
    const trainingAggregationList: TrainingAggregationEntity[] = [];

    for (const { exercises, ...item } of dto) {
      const trainingAggregation = await this.updateTraining(item);

      const newExercises: ExerciseEntity[] = [];
      for (const exercise of exercises) {
        newExercises.push(await this.updateExercise(exercise));
      }
      trainingAggregation.addExercises(newExercises);
      trainingAggregationList.push(trainingAggregation);
    }

    return trainingAggregationList;
  }

  private async updateExercise({
    id: exerciseId,
    ...exerciseData
  }: UpdateTrainingAggregationExercise): Promise<ExerciseEntity> {
    const updatedRawTraining = await this.exerciseRepository.updateAndReplace(
      exerciseId,
      exerciseData,
    );
    if (updatedRawTraining == null) {
      throw new InternalServerErrorException({ id: exerciseId }, { cause: 'Failed to update' });
    }
    return this.exercisesMapper.fromRaw(updatedRawTraining);
  }

  private async updateTraining(
    dto: Omit<UpdateTrainingAggregationRequestData, 'exercises'>,
  ): Promise<TrainingAggregationEntity> {
    const rawTraining = await this.trainingsRepository.findOneById({ id: dto.id });
    if (rawTraining == null) {
      throw new NotFoundException(`training with id ${dto.id} not found`);
    }

    const updatedRawTraining = await this.trainingsRepository.updateAndReplace(dto.id, dto);
    if (updatedRawTraining == null) {
      throw new InternalServerErrorException({ id: dto.id }, { cause: 'Failed to update' });
    }
    return this.trainingsAggregationMapper.fromRaw({
      rawTraining: updatedRawTraining,
    });
  }
}
