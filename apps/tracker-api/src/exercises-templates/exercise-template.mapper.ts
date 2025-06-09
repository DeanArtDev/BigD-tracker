import { RepetitionFinishType } from '@/repetitions/repetitions.entity';
import { RepetitionMapper, RepetitionRawData } from '@/repetitions/repetitions.mapper';
import { UpdateTrainingAggregationExercise } from '@/training-aggregation/use-cases/update-training-aggregation';
import { Injectable } from '@nestjs/common';
import { mapEntity } from '@shared/lib/map-entity';
import { BaseMapper } from '@shared/lib/mapper';
import { DB } from '@shared/modules/db';
import { Selectable } from 'kysely';
import { Insertable, Updateable } from 'kysely/dist/esm';
import { CreateExerciseTemplateRequestData } from './dtos/create-exercises-template.dto';
import { ExerciseTemplateDto } from './dtos/exercise-template.dto';
import { ExerciseTemplateEntity, ExerciseType } from './entity/exercise-template.entity';

interface ExerciseTemplateRawData {
  readonly selectable: Selectable<DB['exercises_templates']>;
  readonly updateable: Updateable<DB['exercises_templates']>;
  readonly insertable: Insertable<DB['exercises_templates']>;
}

@Injectable()
class ExercisesTemplateMapper extends BaseMapper<
  ExerciseTemplateDto,
  ExerciseTemplateEntity,
  {
    rawExercise: ExerciseTemplateRawData['selectable'];
    rawRepetitions?: RepetitionRawData['selectable'][];
  }
> {
  constructor(private readonly repetitionMapper: RepetitionMapper) {
    super();
  }

  fromPersistenceToEntity = (rawData: {
    rawExercise: ExerciseTemplateRawData['selectable'];
    rawRepetitions?: RepetitionRawData['selectable'][];
  }): ExerciseTemplateEntity => {
    const { rawRepetitions = [], rawExercise } = rawData;

    return new ExerciseTemplateEntity({
      id: rawExercise.id,
      name: rawExercise.name,
      type: rawExercise.type as ExerciseType,
      createdAt: rawExercise.created_at.toISOString(),
      updatedAt: rawExercise.updated_at.toISOString(),
      userId: rawExercise.user_id ?? undefined,
      description: rawExercise.description ?? undefined,
      exampleUrl: rawExercise.example_url ?? undefined,
    }).addRepetitions(rawRepetitions.map(this.repetitionMapper.fromPersistenceToEntity));
  };

  fromEntityToPersistence = (
    entity: ExerciseTemplateEntity,
  ): ExerciseTemplateRawData['selectable'] => {
    return {
      id: entity.id,
      type: entity.type,
      name: entity.name,
      created_at: new Date(entity.createdAt),
      updated_at: new Date(entity.updatedAt),
      user_id: entity.userId ?? null,
      description: entity.description ?? null,
      example_url: entity.exampleUrl ?? null,
    };
  };

  fromDtoToEntity = ({ repetitions, ...dto }: ExerciseTemplateDto): ExerciseTemplateEntity => {
    return new ExerciseTemplateEntity(dto).addRepetitions(
      repetitions.map(this.repetitionMapper.fromDtoToEntity),
    );
  };

  fromEntityToDTO = (entity: ExerciseTemplateEntity): ExerciseTemplateDto => {
    return mapEntity(ExerciseTemplateDto, entity);
  };

  fromUpdateDtoToEntity = (
    dto: UpdateTrainingAggregationExercise,
    userId?: number,
  ): ExerciseTemplateEntity => {
    return new ExerciseTemplateEntity({
      id: dto.id,
      type: dto.type,
      name: dto.name,
      userId: userId ?? Infinity,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: dto.description,
      exampleUrl: dto.exampleUrl,
    });
  };

  fromCreateDtoToEntity = (dto: CreateExerciseTemplateRequestData): ExerciseTemplateEntity => {
    return new ExerciseTemplateEntity({
      ...dto,
      id: Infinity,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  fromPersistenceToDto = (raw: {
    rawExercise: ExerciseTemplateRawData['selectable'];
    rawRepetitions?: RepetitionRawData['selectable'][];
  }): ExerciseTemplateDto => {
    const { rawExercise, rawRepetitions = [] } = raw;

    const repetitions: ExerciseTemplateDto['repetitions'] = rawRepetitions.map((repetition) => {
      return {
        id: repetition.id,
        exerciseId: repetition.exercises_id,
        userId: repetition.user_id ?? undefined,
        factBreak: repetition.fact_break ?? undefined,
        factWeight: repetition.fact_weight ?? undefined,
        factCount: repetition.fact_count ?? undefined,
        targetBreak: repetition.target_break,
        targetWeight: repetition.target_weight,
        targetCount: repetition.target_count,
        finishType: repetition.finish_type as RepetitionFinishType,
      };
    });

    const instance: ExerciseTemplateDto = {
      id: rawExercise.id,
      name: rawExercise.name,
      type: rawExercise.type as ExerciseType,
      createdAt: rawExercise.created_at.toISOString(),
      updatedAt: rawExercise.updated_at.toISOString(),
      userId: rawExercise.user_id ?? undefined,
      description: rawExercise.description ?? undefined,
      exampleUrl: rawExercise.example_url ?? undefined,
      repetitions,
    };

    return mapEntity(ExerciseTemplateDto, instance);
  };
}

export { type ExerciseTemplateRawData, ExercisesTemplateMapper };
