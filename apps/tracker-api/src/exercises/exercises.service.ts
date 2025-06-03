import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Nullable } from 'kysely';
import { ExerciseTemplateEntity } from './entity/exercise-template.entity';
import { ExercisesTemplateMapper } from './exercise-template.mapper';
import { ExerciseType } from './entity/exercise.entity';
import { ExercisesTemplatesRepository } from './exercises-templates.repository';

@Injectable()
export class ExercisesService {
  constructor(
    readonly exercisesTemplatesRepository: ExercisesTemplatesRepository,
    readonly exercisesTemplateMapper: ExercisesTemplateMapper,
  ) {}

  async getExercisesTemplates(filters: { userId?: number }): Promise<ExerciseTemplateEntity[]> {
    const rawTemplates = await this.exercisesTemplatesRepository.findByFilters(filters);
    return rawTemplates.map(this.exercisesTemplateMapper.fromPersistenceToEntity);
  }

  async createExerciseTemplate(data: {
    userId?: number;
    name: string;
    description?: string;
    exampleUrl?: string;
    type: ExerciseType;
  }) {
    const rowExercise = await this.exercisesTemplatesRepository.create(data);
    if (rowExercise == null) {
      throw new InternalServerErrorException('Failed to create exercise template');
    }
    return rowExercise;
  }

  async deleteExerciseTemplate(id: number) {
    await this.findExerciseTemplate({ id });
    return await this.exercisesTemplatesRepository.delete(id);
  }

  async findExerciseTemplate({ id }: { id: number }): Promise<ExerciseTemplateEntity> {
    const rawExercise = await this.exercisesTemplatesRepository.findOneById({ id });
    if (rawExercise == null) {
      throw new NotFoundException('Exercise template is not found');
    }
    return this.exercisesTemplateMapper.fromPersistenceToEntity(rawExercise);
  }

  async updateTemplatePartly(
    id: number,
    data: {
      name?: string;
      type?: ExerciseType;
      exampleUrl?: string;
      description?: string;
    },
  ) {
    await this.findExerciseTemplate({ id });
    const exercise = await this.exercisesTemplatesRepository.updatePartly(id, data);
    if (exercise == null) {
      throw new InternalServerErrorException({ id }, { cause: 'Failed to update' });
    }
    return exercise;
  }

  async updateTemplateAndReplace(
    id: number,
    data: {
      name: string;
      type: ExerciseType;
    } & Nullable<{
      exampleUrl: string;
      description: string;
    }>,
  ) {
    await this.findExerciseTemplate({ id });
    const exercise = await this.exercisesTemplatesRepository.updateAndReplace(id, data);
    if (exercise == null) {
      throw new InternalServerErrorException({ id }, { cause: 'Failed to update' });
    }
    return exercise;
  }
}
