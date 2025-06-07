import { CreateExerciseTemplateRequest } from '@/exercises-templates/dtos/create-exercises-template.dto';
import { PutExerciseTemplateRequest } from '@/exercises-templates/dtos/put-exercise-template.dto';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ExerciseTemplateEntity, ExerciseType } from './entity/exercise-template.entity';
import { ExercisesTemplateMapper } from './exercise-template.mapper';
import { ExercisesTemplatesRepository } from './exercises-templates.repository';

@Injectable()
export class ExerciseTemplateService {
  constructor(
    readonly exercisesTemplatesRepository: ExercisesTemplatesRepository,
    readonly exercisesTemplateMapper: ExercisesTemplateMapper,
  ) {}

  async getExercisesTemplates(
    userId: number,
    filters: { my: boolean },
  ): Promise<ExerciseTemplateEntity[]> {
    const rawTemplates = await this.exercisesTemplatesRepository.findByFilters(userId, filters);
    return rawTemplates.map(this.exercisesTemplateMapper.fromPersistenceToEntity);
  }

  async createExerciseTemplate(data: CreateExerciseTemplateRequest['data'] & { userId: number }) {
    const entity = this.exercisesTemplateMapper.fromDtoToEntity({
      ...data,
      id: Infinity,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const raw = this.exercisesTemplateMapper.fromEntityToPersistence(entity);
    const rowExercise = await this.exercisesTemplatesRepository.create({
      type: raw.type,
      name: raw.name,
      user_id: raw.user_id,
      description: raw.description,
      example_url: raw.example_url,
    });
    if (rowExercise == null) {
      throw new InternalServerErrorException('Failed to create exercise template');
    }
    return rowExercise;
  }

  async deleteExerciseTemplate(id: number) {
    await this.findExerciseTemplate({ id });
    await this.exercisesTemplatesRepository.delete(id);
  }

  async findExerciseTemplate({ id }: { id: number }): Promise<ExerciseTemplateEntity> {
    const rawExercise = await this.exercisesTemplatesRepository.findOneById({ id });
    if (rawExercise == null) {
      throw new NotFoundException('Exercise template is not found');
    }
    return this.exercisesTemplateMapper.fromPersistenceToEntity(rawExercise);
  }

  async findExerciseTemplates(ids: number[]): Promise<ExerciseTemplateEntity[]> {
    const list = await this.exercisesTemplatesRepository.findByIds(ids);
    if (list == null) {
      throw new NotFoundException('Exercise templates are not found');
    }

    if (list.length !== ids.length) {
      throw new NotFoundException('Not all exercise templates are found');
    }

    return list.map(this.exercisesTemplateMapper.fromPersistenceToEntity);
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

  async updateTemplates(
    data: PutExerciseTemplateRequest['data'],
  ): Promise<ExerciseTemplateEntity[]> {
    await this.findExerciseTemplates(data.map((i) => i.id));

    try {
      const raws = await this.exercisesTemplatesRepository.update(
        data.map(this.exercisesTemplateMapper.fromUpdateDtoToRaw),
        { replace: true },
      );
      return raws.map(this.exercisesTemplateMapper.fromPersistenceToEntity);
    } catch {
      throw new InternalServerErrorException(`Failed to update exercise templates`);
    }
  }
}
