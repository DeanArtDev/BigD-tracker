import {
  ExercisesTemplateMapper,
  ExerciseTemplateRawData,
} from '@/exercises/exercise-template.mapper';
import { ExercisesTemplatesRepository } from '@/exercises/exercises-templates.repository';
import {
  TrainingTemplatesAggregationRaw,
  TrainingTemplatesAggregationRepository,
} from '@/training-template-aggregation/training-templates-aggregation.repository';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { TrainingTemplateAggregationEntity } from '../../entities/training-template-aggregation.entity';
import { TrainingTemplateAggregationMapper } from '../../training-template-aggregation.mapper';
import { TrainingTemplateAggregationService } from '../../training-template-aggregation.service';
import { CreateTrainingTemplateAggregationRequestData } from './create-training-template-aggregation.dto';

@Injectable()
export class CreateTrainingTemplateAggregationUseCase {
  constructor(
    private readonly trainingTemplateAggregationService: TrainingTemplateAggregationService,
    private readonly trainingTemplateAggregationMapper: TrainingTemplateAggregationMapper,
    private readonly exerciseTemplatesRepository: ExercisesTemplatesRepository,
    private readonly exercisesTemplateMapper: ExercisesTemplateMapper,
    private readonly trainingTemplatesAggregationRepo: TrainingTemplatesAggregationRepository,
  ) {}

  async execute(
    userId: number,
    dto: CreateTrainingTemplateAggregationRequestData[],
  ): Promise<TrainingTemplateAggregationEntity[]> {
    const trainingTemplateList: TrainingTemplateAggregationEntity[] = [];

    for (const item of dto) {
      trainingTemplateList.push(await this.createTrainingTemplate(userId, item));
    }
    return trainingTemplateList;
  }

  private async createTrainingTemplate(
    userId: number,
    data: CreateTrainingTemplateAggregationRequestData,
  ): Promise<TrainingTemplateAggregationEntity> {
    const { exercises, ...item } = data;
    const trainingTemplate = this.trainingTemplateAggregationMapper.fromPersistenceToEntity({
      rawTrainingTemplate: {
        id: Infinity,
        created_at: new Date(),
        updated_at: new Date(),
        type: item.type,
        name: item.name,
        user_id: userId,
        description: item.description ?? null,
        worm_up_duration: item.wormUpDuration ?? null,
        post_training_duration: item.postTrainingDuration ?? null,
      },
    });

    const rawExerciseTemplateList: ExerciseTemplateRawData['selectable'][] = [];
    for (const exercise of exercises) {
      const rawExerciseTemplate =
        await this.trainingTemplatesAggregationRepo.findRawExerciseTemplates(exercise.id);
      rawExerciseTemplateList.push(rawExerciseTemplate);
    }
    trainingTemplate.addExercises(
      rawExerciseTemplateList.map(this.exercisesTemplateMapper.fromPersistenceToEntity),
    );

    let raw: TrainingTemplatesAggregationRaw | undefined;
    try {
      raw = await this.trainingTemplatesAggregationRepo.createTrainingTemplateAggregation({
        trainingTemplate: {
          type: item.type,
          name: item.name,
          description: item.description,
          user_id: userId,
          worm_up_duration: item.wormUpDuration,
          post_training_duration: item.postTrainingDuration,
        },
        exerciseTemplates: rawExerciseTemplateList,
      });
    } catch {
      throw new InternalServerErrorException('Failed to create training');
    }

    if (raw == null) {
      throw new InternalServerErrorException('Failed to create training');
    }

    return this.trainingTemplateAggregationMapper.fromPersistenceToEntity({
      rawTrainingTemplate: raw.trainingTemplate,
      rawExercisesTemplates: raw.exercises,
    });
  }
}
