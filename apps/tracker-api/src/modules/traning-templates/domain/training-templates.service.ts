import { TrainingTemplateWithExercisesDto } from '../application/dtos';
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
  UpdateTrainingTemplateWithExercisesCommand,
  UpdateTrainingTemplateWithExercisesInput,
} from '../application/use-cases';

@Injectable()
class TrainingTemplatesService {
  constructor(
    private readonly getTrainingTemplatesQuery: GetTrainingTemplatesQuery,
    private readonly trainingTemplatesMapper: TrainingTemplatesMapper,

    private readonly getTrainingTemplateWithExercisesQuery: GetTrainingTemplateWithExercisesQuery,
    private readonly trainingTemplatesWithExercisesMapper: TrainingTemplatesWithExercisesMapper,
    private readonly createTrainingTemplateWithExercisesCommand: CreateTrainingTemplateWithExercisesCommand,
    private readonly updateTrainingTemplateWithExercises: UpdateTrainingTemplateWithExercisesCommand,
  ) {}

  async all(input: { userId: number; my?: boolean }): Promise<TrainingTemplateDto[]> {
    const template = await this.getTrainingTemplatesQuery.all(input);
    return template.map(this.trainingTemplatesMapper.fromEntityToDTO);
  }

  async one(input: { id: number; userId?: number }): Promise<TrainingTemplateDto> {
    const template = await this.getTrainingTemplatesQuery.one(input);
    return this.trainingTemplatesMapper.fromEntityToDTO(template);
  }

  async oneWithExercises(input: {
    id: number;
    userId?: number;
  }): Promise<TrainingTemplateWithExercisesDto> {
    const template = await this.getTrainingTemplateWithExercisesQuery.one(input);
    return this.trainingTemplatesWithExercisesMapper.fromEntityToDTO(template);
  }

  async createOneWithExercises(
    input: CreateTrainingTemplateWithExercisesInput,
  ): Promise<TrainingTemplateWithExercisesDto> {
    const template = await this.createTrainingTemplateWithExercisesCommand.execute(input);
    return this.trainingTemplatesWithExercisesMapper.fromEntityToDTO(template);
  }

  async updateOneWithExercises(
    input: UpdateTrainingTemplateWithExercisesInput,
  ): Promise<TrainingTemplateWithExercisesDto> {
    const template = await this.updateTrainingTemplateWithExercises.execute(input);
    return this.trainingTemplatesWithExercisesMapper.fromEntityToDTO(template);
  }
}

export { TrainingTemplatesService };
