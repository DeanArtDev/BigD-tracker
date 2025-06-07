import { ExercisesTemplateMapper } from '@/exercises-templates/exercise-template.mapper';
import { ExercisesTemplatesRepository } from '@/exercises-templates/exercises-templates.repository';
import { TrainingsTemplatesRepository } from '@/tranings/trainings-templates.repository';
import { TrainingsRepository } from '@/tranings/trainings.repository';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { TrainingTemplateAggregationEntity } from './entities/training-template-aggregation.entity';
import { TrainingTemplateAggregationMapper } from './training-template-aggregation.mapper';
import { TrainingTemplatesAggregationRepository } from './training-templates-aggregation.repository';

@Injectable()
export class TrainingTemplateAggregationService {
  constructor(
    private readonly trainingsRepository: TrainingsRepository,
    private readonly trainingsTemplatesRepository: TrainingsTemplatesRepository,
    private readonly trainingTemplateAggregationMapper: TrainingTemplateAggregationMapper,
    private readonly exerciseTemplatesRepository: ExercisesTemplatesRepository,
    private readonly exercisesTemplateMapper: ExercisesTemplateMapper,
    private readonly trainingTemplatesAggregationRepo: TrainingTemplatesAggregationRepository,
  ) {}

  async getTrainings(
    userId: number,
    filters: { my: boolean },
  ): Promise<TrainingTemplateAggregationEntity[]> {
    const rawAggregations =
      await this.trainingTemplatesAggregationRepo.findAllTrainingTemplateAggregation(
        userId,
        filters,
      );
    if (rawAggregations == null) return [];

    return rawAggregations.reduce<TrainingTemplateAggregationEntity[]>((acc, rawAggregation) => {
      acc.push(
        this.trainingTemplateAggregationMapper.fromPersistenceToEntity({
          rawTrainingTemplate: rawAggregation.trainingTemplate,
          rawExercisesTemplates: rawAggregation.exercises,
        }),
      );
      return acc;
    }, []);
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
