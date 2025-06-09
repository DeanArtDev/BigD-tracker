import { RepetitionMapper } from '@/repetitions/repetitions.mapper';
import { RepetitionsRepository } from '@/repetitions/repetitions.repository';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateExerciseTemplateRequest } from './dtos/create-exercises-template.dto';
import { PutExerciseTemplateRequest } from './dtos/put-exercise-template.dto';
import { ExerciseTemplateEntity } from './entity/exercise-template.entity';
import { ExercisesTemplateMapper } from './exercise-template.mapper';
import { ExercisesTemplatesRepository } from './exercises-templates.repository';

@Injectable()
export class ExerciseTemplateService {
  constructor(
    private readonly exercisesTemplatesRepository: ExercisesTemplatesRepository,
    private readonly exercisesTemplateMapper: ExercisesTemplateMapper,
    private readonly repetitionsRepository: RepetitionsRepository,
    private readonly repetitionMapper: RepetitionMapper,
  ) {}

  async getExercisesTemplates(
    userId: number,
    filters: { my: boolean },
  ): Promise<ExerciseTemplateEntity[]> {
    const rawExercises = await this.exercisesTemplatesRepository.findByFilters(userId, filters);

    const buffer: ExerciseTemplateEntity[] = [];
    for (const rawExercise of rawExercises) {
      const exercise = this.exercisesTemplateMapper.fromPersistenceToEntity({ rawExercise });
      const rawRepetitions = await this.repetitionsRepository.findAllByFilters({
        id: exercise.id,
        userId: exercise.userId,
      });
      exercise.addRepetitions(rawRepetitions.map(this.repetitionMapper.fromPersistenceToEntity));
      buffer.push(exercise);
    }

    return buffer;
  }

  async createExerciseTemplate(
    data: CreateExerciseTemplateRequest['data'] & { userId: number },
  ): Promise<ExerciseTemplateEntity> {
    const exerciseEntity = this.exercisesTemplateMapper.fromCreateDtoToEntity(data);
    const rawExercise = await this.exercisesTemplatesRepository.create({
      type: exerciseEntity.type,
      name: exerciseEntity.name,
      user_id: exerciseEntity.userId,
      description: exerciseEntity.description,
      example_url: exerciseEntity.exampleUrl,
    });
    if (rawExercise == null) {
      throw new InternalServerErrorException('Failed to create exercise template');
    }

    return this.exercisesTemplateMapper.fromPersistenceToEntity({ rawExercise });
  }

  async deleteExerciseTemplate(id: number, userId: number) {
    try {
      const exercise = await this.findExerciseTemplate({ id });
      if (exercise.userId !== userId) {
        throw new ForbiddenException('Delete can only your own training templates');
      }
      await this.exercisesTemplatesRepository.delete(id);
      if (exercise) await this.repetitionsRepository.deleteByExerciseIds([id]);
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to delete exercise template {id: ${id}}`);
    }
  }

  async findExerciseTemplate({ id }: { id: number }): Promise<ExerciseTemplateEntity> {
    const rawExercise = await this.exercisesTemplatesRepository.findOneById({ id });
    if (rawExercise == null) {
      throw new NotFoundException('Exercise template is not found');
    }
    return this.exercisesTemplateMapper.fromPersistenceToEntity({ rawExercise });
  }

  async findExerciseTemplates(ids: number[]): Promise<ExerciseTemplateEntity[]> {
    const list = await this.exercisesTemplatesRepository.findByIds(ids);
    if (list == null) {
      throw new NotFoundException('Exercise templates are not found');
    }

    if (list.length !== ids.length) {
      throw new NotFoundException('Not all exercise templates are found');
    }

    return list.map((i) =>
      this.exercisesTemplateMapper.fromPersistenceToEntity({ rawExercise: i }),
    );
  }

  async updateTemplate(
    templateId: number,
    data: PutExerciseTemplateRequest['data'],
  ): Promise<ExerciseTemplateEntity> {
    await this.findExerciseTemplate({ id: templateId });

    try {
      const raws = await this.exercisesTemplatesRepository.update([{ ...data, id: templateId }], {
        replace: true,
      });
      if (raws.length === 0) {
        throw new InternalServerErrorException(`Failed to update exercise templates`);
      }

      return this.exercisesTemplateMapper.fromPersistenceToEntity({
        rawExercise: raws[0],
      });
    } catch {
      throw new InternalServerErrorException(`Failed to update exercise templates`);
    }
  }
}
