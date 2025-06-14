import { TrainingTemplateWithExercisesDto } from '@/modules/traning-templates/application/dtos';
import { Injectable } from '@nestjs/common';
import { TrainingTemplateDto } from '../application/dtos/training-template.dto';
import {
  TrainingTemplatesMapper,
  TrainingTemplatesWithExercisesMapper,
} from '../application/mappers';
import {
  CreateTrainingTemplateWithExercisesCommand,
  CreateTrainingTemplateWithExercisesInput,
  GetTrainingTemplatesQuery,
  GetTrainingTemplateWithExercisesQuery,
} from '../application/use-cases';

@Injectable()
class TrainingTemplatesService {
  constructor(
    private readonly getTrainingTemplatesQuery: GetTrainingTemplatesQuery,
    private readonly trainingTemplatesMapper: TrainingTemplatesMapper,

    private readonly getTrainingTemplateWithExercisesQuery: GetTrainingTemplateWithExercisesQuery,
    private readonly trainingTemplatesWithExercisesMapper: TrainingTemplatesWithExercisesMapper,
    private readonly createTrainingTemplateWithExercisesCommand: CreateTrainingTemplateWithExercisesCommand,
  ) {}

  async all(input: { userId: number; my?: boolean }): Promise<TrainingTemplateDto[]> {
    const trainings = await this.getTrainingTemplatesQuery.all(input);
    return trainings.map(this.trainingTemplatesMapper.fromEntityToDTO);
  }

  async one(input: { id: number; userId?: number }): Promise<TrainingTemplateDto> {
    const training = await this.getTrainingTemplatesQuery.one(input);
    return this.trainingTemplatesMapper.fromEntityToDTO(training);
  }

  async oneWithExercises(input: {
    id: number;
    userId?: number;
  }): Promise<TrainingTemplateWithExercisesDto> {
    const training = await this.getTrainingTemplateWithExercisesQuery.one(input);
    return this.trainingTemplatesWithExercisesMapper.fromEntityToDTO(training);
  }

  async createOneWithExercises(
    input: CreateTrainingTemplateWithExercisesInput,
  ): Promise<TrainingTemplateWithExercisesDto> {
    const training = await this.createTrainingTemplateWithExercisesCommand.execute(input);
    return this.trainingTemplatesWithExercisesMapper.fromEntityToDTO(training);
  }
}

export { TrainingTemplatesService };
