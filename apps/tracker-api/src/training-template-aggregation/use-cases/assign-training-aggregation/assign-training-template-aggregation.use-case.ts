import { ExercisesMapper } from '@/exercises/exercise.mapper';
import { TrainingsAggregationMapper } from '@/training-aggregation/trainings-aggregation.mapper';
import { TrainingsRepository } from '@/tranings/trainings.repository';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { TrainingTemplatesAggregationRepository } from '../../training-templates-aggregation.repository';
import { AssignTrainingTemplateRequest } from './assign-training-template-aggregation.dto';
import { AssignTrainingTemplateAggregationRepository } from './assign-training-template-aggregation.repository';

@Injectable()
export class AssignTrainingTemplateAggregationUseCase {
  constructor(
    private readonly trainingTemplatesAggregationRepo: TrainingTemplatesAggregationRepository,
    private readonly trainingsRepository: TrainingsRepository,
    private readonly trainingsAggregationMapper: TrainingsAggregationMapper,
    private readonly exercisesMapper: ExercisesMapper,
    private readonly assignTrainingTemplateAggregationRepo: AssignTrainingTemplateAggregationRepository,
  ) {}

  async execute(userId: number, dto: AssignTrainingTemplateRequest['data']): Promise<void> {
    for (const item of dto) {
      await this.assign(userId, item);
    }
  }

  async assign(userId: number, dto: AssignTrainingTemplateRequest['data'][0]): Promise<void> {
    const raw = await this.trainingTemplatesAggregationRepo.findTrainingTemplateAggregation({
      templateId: dto.templateId,
    });
    if (raw == null) {
      throw new NotFoundException(`Training template with id ${dto.templateId} is not found!`);
    }

    const rawTraining = await this.trainingsRepository.create({
      ...raw.trainingTemplate,
      user_id: userId,
      start_date: dto.startDate,
    });
    if (rawTraining == null) {
      throw new InternalServerErrorException('Failed to create training');
    }
    const trainingAggregationEntity = this.trainingsAggregationMapper.fromPersistenceToEntity({
      rawTraining,
    });

    trainingAggregationEntity.addExercises(
      raw.exercises.map(this.exercisesMapper.fromPersistenceToEntity),
    );

    await this.assignTrainingTemplateAggregationRepo.attachExerciseTemplateToTraining(
      trainingAggregationEntity.id,
      trainingAggregationEntity.exercises.map((i) => i.id),
    );
  }
}
