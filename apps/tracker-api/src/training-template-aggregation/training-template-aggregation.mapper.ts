import { ExerciseTemplateDto } from '@/exercises-templates/dtos/exercise-template.dto';
import { ExerciseType } from '@/exercises-templates/entity/exercise-template.entity';
import {
  ExercisesTemplateMapper,
  ExerciseTemplateRawData,
} from '@/exercises-templates/exercise-template.mapper';
import { TrainingType } from '@/tranings/entities/training.entity';
import {
  TrainingsTemplatesMapper,
  TrainingTemplateRawData,
} from '@/tranings/trainings-template.mapper';
import { Injectable } from '@nestjs/common';
import { mapAndValidateEntity } from '@shared/lib/map-and-validate-entity';
import { TrainingTemplateAggregationDto } from './dto/training-template-aggregation.dto';
import { TrainingTemplateAggregationEntity } from './entities/training-template-aggregation.entity';

@Injectable()
export class TrainingTemplateAggregationMapper {
  constructor(
    private readonly trainingsTemplatesMapper: TrainingsTemplatesMapper,
    private readonly exercisesTemplatesMapper: ExercisesTemplateMapper,
  ) {}

  fromPersistenceToDto = (raw: {
    rawTraining: TrainingTemplateRawData['selectable'];
    rawExercises?: ExerciseTemplateRawData['selectable'][];
  }): TrainingTemplateAggregationDto => {
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

    const instance: TrainingTemplateAggregationDto = {
      id: rawTraining.id,
      name: rawTraining.name,
      type: rawTraining.type as TrainingType,
      createdAt: rawTraining.created_at.toISOString(),
      updatedAt: rawTraining.updated_at.toISOString(),
      description: rawTraining.description ?? undefined,
      userId: Infinity,
      postTrainingDuration: rawTraining.post_training_duration ?? undefined,
      wormUpDuration: rawTraining.worm_up_duration ?? undefined,
      exercises: exercisesDto,
    };
    return mapAndValidateEntity(TrainingTemplateAggregationDto, instance);
  };

  fromPersistenceToEntity = (raw: {
    rawTrainingTemplate: TrainingTemplateRawData['selectable'];
    rawExercisesTemplates?: ExerciseTemplateRawData['selectable'][];
  }): TrainingTemplateAggregationEntity => {
    const { rawTrainingTemplate, rawExercisesTemplates = [] } = raw;
    const trainingAggregation = new TrainingTemplateAggregationEntity(
      this.trainingsTemplatesMapper.fromPersistenceToEntity(rawTrainingTemplate),
    );
    return trainingAggregation.addExercises(
      rawExercisesTemplates.map(this.exercisesTemplatesMapper.fromPersistenceToEntity),
    );
  };

  fromEntityToPersistence = (
    entity: TrainingTemplateAggregationEntity,
  ): {
    rawTraining: TrainingTemplateRawData['selectable'];
    rawExercises?: ExerciseTemplateRawData['selectable'][];
  } => {
    const { exercises } = entity;
    return {
      rawExercises: exercises.map(this.exercisesTemplatesMapper.fromEntityToPersistence),
      rawTraining: this.trainingsTemplatesMapper.fromEntityToPersistence(entity),
    };
  };

  fromDtoToEntity = (dto: TrainingTemplateAggregationDto): TrainingTemplateAggregationEntity => {
    return new TrainingTemplateAggregationEntity(dto).addExercises(
      dto.exercises.map(this.exercisesTemplatesMapper.fromDtoToEntity),
    );
  };

  fromEntityToDTO = (entity: TrainingTemplateAggregationEntity): TrainingTemplateAggregationDto => {
    return mapAndValidateEntity(TrainingTemplateAggregationDto, entity);
  };
}
