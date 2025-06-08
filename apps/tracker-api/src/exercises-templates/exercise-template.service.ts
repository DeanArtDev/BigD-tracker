import { RepetitionMapper } from '@/repetitions/repetitions.mapper';
import { RepetitionsRepository } from '@/repetitions/repetitions.repository';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateExerciseTemplateRequest } from './dtos/create-exercises-template.dto';
import { PutExerciseTemplateRequest } from './dtos/put-exercise-template.dto';
import { ExerciseTemplateEntity } from './entity/exercise-template.entity';
import { ExercisesTemplateMapper } from './exercise-template.mapper';
import { ExercisesTemplatesRepository } from './exercises-templates.repository';

@Injectable()
export class ExerciseTemplateService {
  constructor(
    readonly exercisesTemplatesRepository: ExercisesTemplatesRepository,
    readonly exercisesTemplateMapper: ExercisesTemplateMapper,
    readonly repetitionsRepository: RepetitionsRepository,
    readonly repetitionMapper: RepetitionMapper,
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
        userId,
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
    const rawRepetitions = await this.repetitionsRepository.createMany(
      data.repetitions.map((rep) => {
        return {
          exercises_id: rawExercise.id,
          target_break: rep.targetBreak,
          target_count: rep.targetCount,
          target_weight: rep.targetWeight,
          user_id: exerciseEntity.userId,
        };
      }),
    );
    return this.exercisesTemplateMapper
      .fromPersistenceToEntity({ rawExercise })
      .addRepetitions(rawRepetitions.map(this.repetitionMapper.fromPersistenceToEntity));
  }

  async deleteExerciseTemplate(id: number) {
    try {
      const exercise = await this.findExerciseTemplate({ id });
      await this.exercisesTemplatesRepository.delete(id);
      if (exercise) await this.repetitionsRepository.deleteByExerciseIds([id]);
    } catch {
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

      const exerciseEntity = this.exercisesTemplateMapper.fromPersistenceToEntity({
        rawExercise: raws[0],
      });

      await this.repetitionsRepository.deleteByExerciseIds([exerciseEntity.id]);

      const rawRepetitions = await this.repetitionsRepository.createMany(
        data.repetitions.map((rep) => {
          return {
            exercises_id: exerciseEntity.id,
            target_break: rep.targetBreak,
            target_count: rep.targetCount,
            target_weight: rep.targetWeight,
            user_id: exerciseEntity.userId,
          };
        }),
      );

      return exerciseEntity.addRepetitions(
        rawRepetitions.map(this.repetitionMapper.fromPersistenceToEntity),
      );
    } catch {
      throw new InternalServerErrorException(`Failed to update exercise templates`);
    }
  }
}
