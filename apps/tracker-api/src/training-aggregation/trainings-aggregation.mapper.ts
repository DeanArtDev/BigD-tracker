import {
  ExercisesTemplateMapper,
  ExerciseTemplateRawData,
} from '@/exercises-templates/exercise-template.mapper';
import { UpdateTrainingAggregationRequestData } from '@/training-aggregation/use-cases/update-training-aggregation';
import { TrainingType } from '@/tranings/entities/training.entity';
import { TrainingRawData, TrainingsMapper } from '@/tranings/trainings.mapper';
import { Injectable } from '@nestjs/common';
import { mapEntity } from '@shared/lib/map-entity';
import { TrainingAggregationDto } from './dto/training-aggregation.dto';
import { TrainingAggregationEntity } from './entities/training-aggregation.entity';

@Injectable()
export class TrainingsAggregationMapper {
  constructor(
    private readonly trainingsMapper: TrainingsMapper,
    private readonly exercisesTemplateMapper: ExercisesTemplateMapper,
  ) {}

  fromPersistenceToDto = (raw: {
    rawTraining: TrainingRawData['selectable'];
    rawExercises?: ExerciseTemplateRawData['selectable'][];
  }): TrainingAggregationDto => {
    const { rawTraining, rawExercises = [] } = raw;

    const instance: TrainingAggregationDto = {
      id: rawTraining.id,
      name: rawTraining.name,
      type: rawTraining.type as TrainingType,
      description: rawTraining.description ?? undefined,
      endDate: rawTraining.end_date?.toISOString(),
      createdAt: rawTraining.created_at.toISOString(),
      userId: rawTraining.user_id,
      startDate: rawTraining.start_date.toISOString(),
      updatedAt: rawTraining.updated_at.toISOString(),
      postTrainingDuration: rawTraining.post_training_duration ?? undefined,
      wormUpDuration: rawTraining.worm_up_duration ?? undefined,
      inProgress: rawTraining.in_progress,
      exercises: rawExercises.map((i) =>
        this.exercisesTemplateMapper.fromPersistenceToDto({ rawExercise: i }),
      ),
    };
    return mapEntity(TrainingAggregationDto, instance);
  };

  fromPersistenceToEntity = (raw: {
    rawTraining: TrainingRawData['selectable'];
    rawExercises?: ExerciseTemplateRawData['selectable'][];
  }): TrainingAggregationEntity => {
    const { rawTraining, rawExercises = [] } = raw;
    const trainingAggregation = new TrainingAggregationEntity(
      this.trainingsMapper.fromPersistenceToEntity(rawTraining),
    );
    return trainingAggregation.addExercises(
      rawExercises.map((i) =>
        this.exercisesTemplateMapper.fromPersistenceToEntity({ rawExercise: i }),
      ),
    );
  };

  fromEntityToPersistence = (
    entity: TrainingAggregationEntity,
  ): {
    rawTraining: TrainingRawData['selectable'];
    rawExercises?: ExerciseTemplateRawData['selectable'][];
  } => {
    const { exercises } = entity;
    return {
      rawExercises: exercises.map(this.exercisesTemplateMapper.fromEntityToPersistence),
      rawTraining: this.trainingsMapper.fromEntityToPersistence(entity),
    };
  };

  fromUpdateDtoToEntity = (
    dto: Omit<UpdateTrainingAggregationRequestData, 'exercises'>,
    userId?: number,
  ): TrainingAggregationEntity => {
    return new TrainingAggregationEntity({
      id: dto.id,
      userId: userId ?? Infinity,
      type: dto.type,
      name: dto.name,
      description: dto.description ?? undefined,
      inProgress: dto.inProgress,
      startDate: dto.startDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      postTrainingDuration: dto.postTrainingDuration ?? undefined,
      wormUpDuration: dto.wormUpDuration ?? undefined,
    });
  };

  fromDtoToEntity = (dto: TrainingAggregationDto): TrainingAggregationEntity => {
    return new TrainingAggregationEntity(dto).addExercises(
      dto.exercises.map(this.exercisesTemplateMapper.fromDtoToEntity),
    );
  };

  fromEntityToDTO = (entity: TrainingAggregationEntity): TrainingAggregationDto => {
    return mapEntity(TrainingAggregationDto, entity);
  };
}
