import { Injectable } from '@nestjs/common';
import { TrainingTemplateWithExercisesDto } from '../application/dtos';
import { TrainingTemplateDto } from '../application/dtos/training-template.dto';
import {
  TrainingTemplatesMapper,
  TrainingTemplatesWithExercisesMapper,
} from '../application/mappers';
import {
  CreateTrainingTemplateWithExercisesCommand,
  CreateTrainingTemplateWithExercisesInput,
  GetTrainingTemplatesQuery,
  UpdateTrainingTemplateWithExercisesCommand,
  UpdateTrainingTemplateWithExercisesInput,
} from '../application/use-cases';

@Injectable()
class TrainingTemplatesService {
  constructor(
    private readonly getTrainingTemplatesQuery: GetTrainingTemplatesQuery,
    private readonly trainingTemplatesMapper: TrainingTemplatesMapper,

    private readonly trainingTemplatesWithExercisesMapper: TrainingTemplatesWithExercisesMapper,
    private readonly createTrainingTemplateWithExercisesCommand: CreateTrainingTemplateWithExercisesCommand,
    private readonly updateTrainingTemplateWithExercises: UpdateTrainingTemplateWithExercisesCommand,
  ) {}

  async all(input: { userId: number; my?: boolean }): Promise<TrainingTemplateDto[]> {
    const template = await this.getTrainingTemplatesQuery.all(input);
    return template.map(this.trainingTemplatesMapper.fromEntityToDTO);
  }

  async oneWithExercises(input: { id: number }): Promise<TrainingTemplateWithExercisesDto> {
    const template = await this.getTrainingTemplatesQuery.oneWithExercises(input);
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
