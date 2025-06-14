import { Injectable } from '@nestjs/common';
import { TrainingWithExercisesDto } from './dtos/training-with-exercises.dto';
import { TrainingDto } from './dtos/training.dto';
import { TrainingsWithExercisesMapper } from './mappers/trainings-with-exercises.mapper';
import { TrainingsMapper } from './mappers/trainings.mapper';
import { GetTrainingsQuery } from './use-cases/queries/get-trainings.query';
import {
  CreateTrainingWithExercisesCommand,
  CreateTrainingWithExercisesInput,
  GetTrainingsWithExercisesQuery,
  UpdateTrainingWithExercisesCommand,
  UpdateTrainingWithExercisesInput,
} from './use-cases';

@Injectable()
class TrainingsService {
  constructor(
    private readonly trainingsWithExercisesMapper: TrainingsWithExercisesMapper,
    private readonly getTrainingsWithExercises: GetTrainingsWithExercisesQuery,
    private readonly createTrainingWithExercisesCommand: CreateTrainingWithExercisesCommand,
    private readonly updateTrainingWithExercisesCommand: UpdateTrainingWithExercisesCommand,

    private readonly trainingsMapper: TrainingsMapper,
    private readonly getTrainingsQuery: GetTrainingsQuery,
  ) {}

  async all(input: { userId: number; from?: string; to?: string }): Promise<TrainingDto[]> {
    const trainings = await this.getTrainingsQuery.all(input);
    return trainings.map(this.trainingsMapper.fromEntityToDTO);
  }

  async one(input: { id: number; userId?: number }): Promise<TrainingDto> {
    const training = await this.getTrainingsQuery.one(input);
    return this.trainingsMapper.fromEntityToDTO(training);
  }

  async oneWithExercises(input: { id: number; userId: number }): Promise<TrainingWithExercisesDto> {
    const training = await this.getTrainingsWithExercises.one(input);
    return this.trainingsWithExercisesMapper.fromEntityToDTO(training);
  }

  async createWithExercises(
    input: CreateTrainingWithExercisesInput,
  ): Promise<TrainingWithExercisesDto> {
    const training = await this.createTrainingWithExercisesCommand.execute(input);
    return this.trainingsWithExercisesMapper.fromEntityToDTO(training);
  }

  async updateWithExercises(
    input: UpdateTrainingWithExercisesInput,
  ): Promise<TrainingWithExercisesDto> {
    const training = await this.updateTrainingWithExercisesCommand.execute(input);
    return this.trainingsWithExercisesMapper.fromEntityToDTO(training);
  }
}

export { TrainingsService };
