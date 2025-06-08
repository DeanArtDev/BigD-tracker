import { ExerciseTemplateEntity } from '@/exercises-templates/entity/exercise-template.entity';
import { ExercisesTemplateMapper } from '@/exercises-templates/exercise-template.mapper';
import { ExercisesTemplatesRepository } from '@/exercises-templates/exercises-templates.repository';
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
    private readonly trainingsRepository: TrainingsRepository,
    private readonly exerciseTemplatesRepository: ExercisesTemplatesRepository,
    private readonly trainingsAggregationMapper: TrainingsAggregationMapper,
    private readonly exercisesTemplateMapper: ExercisesTemplateMapper,
  ) {}

  async execute(
    userId: number,
    dto: CreateTrainingAggregationRequestData[],
  ): Promise<TrainingAggregationEntity[]> {
    const trainingAggregationList: TrainingAggregationEntity[] = [];

    for (const { exercises, ...item } of dto) {
      const trainingAggregation = await this.createTraining({ userId, ...item });

      const newExercises: ExerciseTemplateEntity[] = [];
      for (const e of exercises) {
        const exerciseEntity = await this.createExercise({
          userId,
          trainingId: trainingAggregation.id,
          ...e,
        });

        newExercises.push(exerciseEntity);
      }
      trainingAggregation.addExercises(newExercises);
      trainingAggregationList.push(trainingAggregation);
    }

    return trainingAggregationList;
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
    data: CreateTrainingAggregationExercise & { userId: number; trainingId: number },
  ): Promise<ExerciseTemplateEntity> {
    const rawExerciseTemplate = await this.exerciseTemplatesRepository.findOneById({
      id: data.id,
    });
    if (rawExerciseTemplate == null) {
      throw new NotFoundException('Exercise template is not found');
    }

    return this.exercisesTemplateMapper.fromPersistenceToEntity(rawExerciseTemplate);
  }
}
