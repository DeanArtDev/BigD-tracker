import {
  ExercisesTemplateMapper,
  ExerciseTemplateRawData,
} from '@/exercises-templates/exercise-template.mapper';
import { ExercisesTemplatesRepository } from '@/exercises-templates/exercises-templates.repository';
import {
  TrainingTemplatesAggregationRaw,
  TrainingTemplatesAggregationRepository,
} from '@/training-template-aggregation/training-templates-aggregation.repository';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { TrainingTemplateAggregationEntity } from '../../entities/training-template-aggregation.entity';
import { TrainingTemplateAggregationMapper } from '../../training-template-aggregation.mapper';
import { CreateTrainingTemplateAggregationRequestData } from './create-training-template-aggregation.dto';

@Injectable()
export class CreateTrainingTemplateAggregationUseCase {
  constructor(
    private readonly trainingTemplateAggregationMapper: TrainingTemplateAggregationMapper,
    private readonly exercisesTemplatesRepository: ExercisesTemplatesRepository,
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
      const rawExerciseTemplate = await this.findExerciseTemplate(exercise.id);
      rawExerciseTemplateList.push(rawExerciseTemplate);
    }
    trainingTemplate.addExercises(
      rawExerciseTemplateList.map((i) =>
        this.exercisesTemplateMapper.fromPersistenceToEntity({ rawExercise: i }),
      ),
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

  private async findExerciseTemplate(
    exerciseId: number,
  ): Promise<ExerciseTemplateRawData['selectable']> {
    const raw = await this.exercisesTemplatesRepository.findOneById({ id: exerciseId });
    if (raw == null) {
      throw new NotFoundException(`Exercise template with id: ${exerciseId} is not found`);
    }
    return raw;
  }
}
