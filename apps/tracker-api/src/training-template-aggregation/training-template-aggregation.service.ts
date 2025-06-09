import { ExercisesTemplateMapper } from '@/exercises-templates/exercise-template.mapper';
import { ExercisesTemplatesRepository } from '@/exercises-templates/exercises-templates.repository';
import { RepetitionMapper } from '@/repetitions/repetitions.mapper';
import { RepetitionsRepository } from '@/repetitions/repetitions.repository';
import { TrainingsTemplatesRepository } from '@/tranings/trainings-templates.repository';
import { TrainingsRepository } from '@/tranings/trainings.repository';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { TrainingTemplateAggregationEntity } from './entities/training-template-aggregation.entity';
import { TrainingTemplatesAggregationMapper } from './training-templates-aggregation-mapper.service';
import { TrainingTemplatesAggregationRepository } from './training-templates-aggregation.repository';

@Injectable()
export class TrainingTemplateAggregationService {
  constructor(
    private readonly trainingsRepository: TrainingsRepository,

    private readonly exercisesTemplateMapper: ExercisesTemplateMapper,
    private readonly exerciseTemplatesRepository: ExercisesTemplatesRepository,

    private readonly trainingsTemplatesRepository: TrainingsTemplatesRepository,

    private readonly trainingTemplatesAggregationRepo: TrainingTemplatesAggregationRepository,
    private readonly trainingTemplatesAggregationMapper: TrainingTemplatesAggregationMapper,

    private readonly repetitionMapper: RepetitionMapper,
    private readonly repetitionsRepository: RepetitionsRepository,
  ) {}

  async getTrainings(
    userId: number,
    filters: { my: boolean },
  ): Promise<TrainingTemplateAggregationEntity[]> {
    const raws = await this.trainingTemplatesAggregationRepo.findAllTrainingTemplateAggregation(
      userId,
      filters,
    );
    if (raws == null) return [];

    const buffer: TrainingTemplateAggregationEntity[] = [];
    for (const raw of raws) {
      const templateEntity = this.trainingTemplatesAggregationMapper.fromPersistenceToEntity({
        rawTrainingTemplate: raw.trainingTemplate,
        rawExercisesTemplates: raw.exercises,
      });

      for (const exercise of templateEntity.exercises) {
        const rawRepetitions = await this.repetitionsRepository.findAllByFilters({
          id: exercise.id,
          userId: exercise.userId,
        });
        exercise.addRepetitions(rawRepetitions.map(this.repetitionMapper.fromPersistenceToEntity));
      }

      buffer.push(templateEntity);
    }

    return buffer;
  }

  async deleteTrainingTemplate(data: { id: number; userId: number }) {
    const template = await this.trainingsTemplatesRepository.findOneById({ id: data.id });
    if (template?.user_id !== data.userId) {
      throw new ForbiddenException('Delete can only your own training templates');
    }
    const isDeleted = await this.trainingsTemplatesRepository.delete(data);
    if (!isDeleted) {
      throw new NotFoundException(`Training with id ${data.id} not found`);
    }
  }
}
