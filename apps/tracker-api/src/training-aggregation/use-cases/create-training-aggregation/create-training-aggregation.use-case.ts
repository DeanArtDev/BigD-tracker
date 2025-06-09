import { ExerciseTemplateEntity } from '@/exercises-templates/entity/exercise-template.entity';
import { ExercisesTemplateMapper } from '@/exercises-templates/exercise-template.mapper';
import { ExercisesTemplatesRepository } from '@/exercises-templates/exercises-templates.repository';
import { RepetitionMapper } from '@/repetitions/repetitions.mapper';
import { RepetitionsRepository } from '@/repetitions/repetitions.repository';
import { TrainingsAggregationService } from '../../trainings-aggregation.service';
import { TrainingsRepository } from '@/tranings/trainings.repository';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { TrainingAggregationEntity } from '../../entities/training-aggregation.entity';
import { TrainingsAggregationMapper } from '../../trainings-aggregation.mapper';
import {
  CreateTrainingAggregationExercise,
  CreateTrainingAggregationRequestData,
} from './create-training-aggregation.dto';

@Injectable()
export class CreateTrainingAggregationUseCase {
  constructor(
    private readonly trainingsAggregationMapper: TrainingsAggregationMapper,
    private readonly trainingsAggregationService: TrainingsAggregationService,

    private readonly trainingsRepository: TrainingsRepository,

    private readonly exercisesTemplateMapper: ExercisesTemplateMapper,
    private readonly exerciseTemplatesRepository: ExercisesTemplatesRepository,
  ) {}

  async execute(
    userId: number,
    { exercises, ...item }: CreateTrainingAggregationRequestData,
  ): Promise<TrainingAggregationEntity> {
    const trainingAggregation = await this.createTraining({ userId, ...item });

    const newExercises: ExerciseTemplateEntity[] = [];
    for (const exercise of exercises) {
      const exerciseEntity = await this.createExercise(userId, trainingAggregation.id, {
        userId,
        trainingId: trainingAggregation.id,
        ...exercise,
      });

      newExercises.push(exerciseEntity);
    }

    return trainingAggregation.addExercises(newExercises);
  }

  private async createTraining(
    data: Omit<CreateTrainingAggregationRequestData, 'exercises'> & { userId: number },
  ): Promise<TrainingAggregationEntity> {
    const entity = this.trainingsAggregationMapper.fromPersistenceToEntity({
      rawTraining: {
        id: Infinity,
        name: data.name,
        type: data.type,
        user_id: data.userId,
        created_at: new Date(),
        updated_at: new Date(),
        description: data.description ?? null,
        worm_up_duration: data.wormUpDuration ?? null,
        end_date: null,
        start_date: new Date(),
        post_training_duration: data.postTrainingDuration ?? null,
        in_progress: data.inProgress,
      },
    });
    const persistenceData = this.trainingsAggregationMapper.fromEntityToPersistence(entity);

    const rawTraining = await this.trainingsRepository.create(persistenceData.rawTraining);
    if (rawTraining == null) {
      throw new InternalServerErrorException('Failed to create training');
    }
    return this.trainingsAggregationMapper.fromPersistenceToEntity({ rawTraining });
  }

  private async createExercise(
    userId: number,
    trainingId: number,
    data: CreateTrainingAggregationExercise & { userId: number; trainingId: number },
  ): Promise<ExerciseTemplateEntity> {
    const rawExerciseTemplate = await this.exerciseTemplatesRepository.findOneById({
      id: data.id,
    });
    if (rawExerciseTemplate == null) {
      throw new NotFoundException('Exercise template is not found');
    }

    const exerciseEntity = this.exercisesTemplateMapper.fromPersistenceToEntity({
      rawExercise: rawExerciseTemplate,
    });

    const repetitions = await this.trainingsAggregationService.createRepetitions(
      userId,
      trainingId,
      exerciseEntity.id,
      data.repetitions,
    );

    return exerciseEntity.addRepetitions(repetitions);
  }
}
