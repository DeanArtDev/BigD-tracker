import { ExerciseTemplateDto } from '@/exercises/dtos/exercise-template.dto';
import { ExerciseType } from '@/exercises/entity/exercise-template.entity';
import { ExerciseTemplateRawData } from '@/exercises/exercise-template.mapper';
import { ExercisesMapper } from '@/exercises/exercise.mapper';
import { TrainingType } from '@/tranings/entities/training.entity';
import { TrainingRawData, TrainingsMapper } from '@/tranings/trainings.mapper';
import { Injectable } from '@nestjs/common';
import { mapAndValidateEntity } from '@shared/lib/map-and-validate-entity';
import { TrainingAggregationDto } from './dto/training-aggregation.dto';
import { TrainingAggregationEntity } from './entities/training-aggregation.entity';

@Injectable()
export class TrainingsAggregationMapper {
  constructor(
    private readonly trainingsMapper: TrainingsMapper,
    private readonly exercisesMapper: ExercisesMapper,
  ) {}

  fromPersistenceToDto = (raw: {
    rawTraining: TrainingRawData['selectable'];
    rawExercises?: ExerciseTemplateRawData['selectable'][];
  }): TrainingAggregationDto => {
    const { rawTraining, rawExercises = [] } = raw;

    const exercisesDto: ExerciseTemplateDto[] = rawExercises.map((ex) => {
      return {
        id: ex.id,
        name: ex.name,
        type: ex.type as ExerciseType,
        userId: ex.user_id ?? undefined,
        createdAt: ex.created_at.toISOString(),
        updatedAt: ex.updated_at.toISOString(),
        description: ex.description ?? undefined,
        exampleUrl: ex.example_url ?? undefined,
      };
    });

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
      exercises: exercisesDto,
    };
    return mapAndValidateEntity(TrainingAggregationDto, instance);
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
      rawExercises.map(this.exercisesMapper.fromPersistenceToEntity),
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
      rawExercises: exercises.map(this.exercisesMapper.fromEntityToPersistence),
      rawTraining: this.trainingsMapper.fromEntityToPersistence(entity),
    };
  };

  fromDtoToEntity = (dto: TrainingAggregationDto): TrainingAggregationEntity => {
    return new TrainingAggregationEntity(dto).addExercises(
      dto.exercises.map(this.exercisesMapper.fromDtoToEntity),
    );
  };

  fromEntityToDTO = (entity: TrainingAggregationEntity): TrainingAggregationDto => {
    return mapAndValidateEntity(TrainingAggregationDto, entity);
  };
}
