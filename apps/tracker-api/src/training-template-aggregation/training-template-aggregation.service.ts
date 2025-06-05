import { Injectable, NotFoundException } from '@nestjs/common';
import { ExerciseTemplateEntity } from '@/exercises/entity/exercise-template.entity';
import { ExercisesTemplateMapper } from '@/exercises/exercise-template.mapper';
import { ExercisesTemplatesRepository } from '@/exercises/exercises-templates.repository';
import { TrainingsTemplatesRepository } from '@/tranings/trainings-templates.repository';
import { ExercisesRepository } from '@/exercises/exercises.repository';
import { TrainingsRepository } from '@/tranings/trainings.repository';
import { TrainingTemplatesAggregationRepository } from './training-templates-aggregation.repository';
import { TrainingTemplateAggregationEntity } from './entities/training-template-aggregation.entity';
import { TrainingTemplateAggregationMapper } from './training-template-aggregation.mapper';

@Injectable()
export class TrainingTemplateAggregationService {
  constructor(
    private readonly trainingsRepository: TrainingsRepository,
    private readonly trainingsTemplatesRepository: TrainingsTemplatesRepository,
    private readonly exercisesRepository: ExercisesRepository,
    private readonly trainingTemplateAggregationMapper: TrainingTemplateAggregationMapper,
    private readonly exerciseTemplatesRepository: ExercisesTemplatesRepository,
    private readonly exercisesTemplateMapper: ExercisesTemplateMapper,
    private readonly trainingTemplatesAggregationRepo: TrainingTemplatesAggregationRepository,
  ) {}

  async getTrainings(data: { userId?: number }): Promise<TrainingTemplateAggregationEntity[]> {
    const rawAggregations =
      await this.trainingTemplatesAggregationRepo.getAllTrainingTemplateAggregation({
        userId: data?.userId,
      });
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

  async deleteTrainingAggregation(trainingId: number): Promise<void> {
    const isDeleted = await this.trainingsRepository.delete({ id: trainingId });
    if (!isDeleted) {
      throw new NotFoundException(`Training with id ${trainingId} not found`);
    }
  }

  async findExerciseTemplateById(id: number): Promise<ExerciseTemplateEntity> {
    const rawExerciseTemplate = await this.exerciseTemplatesRepository.findOneById({
      id,
    });
    if (rawExerciseTemplate == null) {
      throw new NotFoundException('Exercise template is not found');
    }
    return this.exercisesTemplateMapper.fromPersistenceToEntity(rawExerciseTemplate);
  }

  async findTrainingTemplateAggregationById(
    id: number,
  ): Promise<TrainingTemplateAggregationEntity> {
    const rawTrainingTemplate = await this.trainingsTemplatesRepository.findOneById({
      id,
    });
    if (rawTrainingTemplate == null) {
      throw new NotFoundException('Training template is not found');
    }
    return this.trainingTemplateAggregationMapper.fromPersistenceToEntity({ rawTrainingTemplate });
  }
}
