import {
  ExercisesTemplateMapper,
  ExerciseTemplateRawData,
} from '@/exercises-templates/exercise-template.mapper';
import { ExercisesTemplatesRepository } from '@/exercises-templates/exercises-templates.repository';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { TrainingTemplateAggregationEntity } from '../../entities/training-template-aggregation.entity';
import { TrainingTemplateAggregationMapper } from '../../training-template-aggregation.mapper';
import { TrainingTemplateAggregationService } from '../../training-template-aggregation.service';
import { TrainingTemplatesAggregationRepository } from '../../training-templates-aggregation.repository';
import { UpdateTrainingTemplateAggregationRequestData } from './update-training-template-aggregation.dto';

@Injectable()
export class UpdateTrainingTemplateAggregationUseCase {
  constructor(
    private readonly trainingTemplateAggregationService: TrainingTemplateAggregationService,
    private readonly trainingTemplateAggregationMapper: TrainingTemplateAggregationMapper,
    private readonly exercisesTemplateMapper: ExercisesTemplateMapper,
    private readonly exercisesTemplatesRepository: ExercisesTemplatesRepository,
    private readonly trainingTemplatesAggregationRepo: TrainingTemplatesAggregationRepository,
  ) {}

  async execute(
    userId: number,
    dto: UpdateTrainingTemplateAggregationRequestData[],
  ): Promise<TrainingTemplateAggregationEntity[]> {
    const trainingTemplateList: TrainingTemplateAggregationEntity[] = [];

    for (const item of dto) {
      trainingTemplateList.push(await this.updateTrainingTemplate(userId, item));
    }
    return trainingTemplateList;
  }

  private async updateTrainingTemplate(
    userId: number,
    data: UpdateTrainingTemplateAggregationRequestData,
  ): Promise<TrainingTemplateAggregationEntity> {
    const { exercises, ...item } = data;

    const trainingTemplate = this.trainingTemplateAggregationMapper.fromPersistenceToEntity({
      rawTrainingTemplate: {
        id: item.id,
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
      rawExerciseTemplateList.map((rawExercise) =>
        this.exercisesTemplateMapper.fromPersistenceToEntity({ rawExercise }),
      ),
    );

    const raw = await this.trainingTemplatesAggregationRepo.updateTrainingTemplateAggregation(
      {
        trainingTemplate: {
          id: item.id,
          type: item.type,
          name: item.name,
          description: item.description,
          user_id: userId,
          worm_up_duration: item.wormUpDuration,
          post_training_duration: item.postTrainingDuration,
        },
        exerciseTemplates: rawExerciseTemplateList,
      },
      { replace: true },
    );

    if (raw == null) {
      throw new InternalServerErrorException(`Failed to update training with id: ${item.id}`);
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
