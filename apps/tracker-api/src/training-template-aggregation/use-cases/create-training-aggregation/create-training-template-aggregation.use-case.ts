import {
  ExercisesTemplateMapper,
  ExerciseTemplateRawData,
} from '@/exercises/exercise-template.mapper';
import { ExercisesTemplatesRepository } from '@/exercises/exercises-templates.repository';
import { TrainingTemplatesAggregationRepository } from '@/training-template-aggregation/training-templates-aggregation.repository';
import { TrainingsTemplatesRepository } from '@/tranings/trainings-templates.repository';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { TrainingTemplateAggregationEntity } from '../../entities/training-template-aggregation.entity';
import { TrainingTemplateAggregationMapper } from '../../training-template-aggregation.mapper';
import { TrainingTemplateAggregationService } from '../../training-template-aggregation.service';
import {
  CreateTrainingTemplateAggregationRequestData,
  CreateTrainingTemplatesAggregationExercise,
} from './create-training-template-aggregation.dto';

@Injectable()
export class CreateTrainingTemplateAggregationUseCase {
  constructor(
    private readonly trainingTemplateAggregationService: TrainingTemplateAggregationService,
    private readonly trainingTemplateRepository: TrainingsTemplatesRepository,
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
      trainingTemplateList.push(await this.createTrainingTemplate(item));
    }
    return trainingTemplateList;
  }

  private async createTrainingTemplate(
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
        user_id: item.userId ?? null,
        description: item.description ?? null,
        worm_up_duration: item.wormUpDuration ?? null,
        post_training_duration: item.postTrainingDuration ?? null,
      },
    });

    const rawExerciseTemplateList: ExerciseTemplateRawData['selectable'][] = [];
    for (const exercise of exercises) {
      const rawExerciseTemplate = await this.findRawExerciseTemplates(exercise);
      rawExerciseTemplateList.push(rawExerciseTemplate);
    }
    trainingTemplate.addExercises(
      rawExerciseTemplateList.map(this.exercisesTemplateMapper.fromPersistenceToEntity),
    );

    const raw = await this.trainingTemplatesAggregationRepo.createTrainingTemplateAggregation({
      trainingTemplate: {
        type: item.type,
        name: item.name,
        description: item.description,
        user_id: item.userId,
        worm_up_duration: item.wormUpDuration,
        post_training_duration: item.postTrainingDuration,
      },
      exerciseTemplates: rawExerciseTemplateList,
    });

    if (raw == null) {
      throw new InternalServerErrorException('Failed to create training');
    }
    if (raw.exercises.length !== exercises.length) {
      await this.exerciseTemplatesRepository.delete(raw.trainingTemplate.id);
      throw new InternalServerErrorException('Failed to create training');
    }

    try {
      return this.trainingTemplateAggregationMapper.fromPersistenceToEntity({
        rawTrainingTemplate: raw.trainingTemplate,
        rawExercisesTemplates: raw.exercises,
      });
    } catch (error) {
      await this.exerciseTemplatesRepository.delete(raw.trainingTemplate.id);
      throw error;
    }
  }

  private async findRawExerciseTemplates(
    exercise: CreateTrainingTemplatesAggregationExercise,
  ): Promise<ExerciseTemplateRawData['selectable']> {
    const rawExerciseTemplate = await this.exerciseTemplatesRepository.findOneById({
      id: exercise.id,
    });
    if (rawExerciseTemplate == null) {
      throw new NotFoundException(`Exercise template with id: ${exercise.id} is not found`);
    }
    return rawExerciseTemplate;
  }
}
