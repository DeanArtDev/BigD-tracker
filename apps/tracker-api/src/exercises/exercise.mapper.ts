import { Injectable } from '@nestjs/common';
import { mapAndValidateEntity } from '@shared/lib/map-and-validate-entity';
import { BaseMapper } from '@shared/lib/mapper';
import { DB } from '@shared/modules/db';
import { Insertable, Selectable, Updateable } from 'kysely';
import { ExerciseDto } from './dtos/exercise.dto';
import { ExerciseEntity, ExerciseType } from './entity/exercise.entity';

interface ExerciseRawData {
  readonly selectable: Selectable<DB['exercises']>;
  readonly updateable: Updateable<DB['exercises']>;
  readonly insertable: Insertable<DB['exercises']>;
}

@Injectable()
class ExercisesMapper extends BaseMapper<
  ExerciseDto,
  ExerciseEntity,
  ExerciseRawData['selectable']
> {
  fromPersistenceToEntity = (rawData: ExerciseRawData['selectable']): ExerciseEntity => {
    return new ExerciseEntity({
      id: rawData.id,
      name: rawData.name,
      userId: rawData.user_id,
      trainingId: rawData.training_id,
      type: rawData.type as ExerciseType,
      createdAt: rawData.created_at.toISOString(),
      updatedAt: rawData.updated_at.toISOString(),
      description: rawData.description ?? undefined,
      exampleUrl: rawData.example_url ?? undefined,
    });
  };

  fromPersistenceToDto = (raw: ExerciseRawData['selectable']): ExerciseDto => {
    const instance: ExerciseDto = {
      id: raw.id,
      userId: raw.user_id,
      type: raw.type as ExerciseType,
      createdAt: raw.created_at.toISOString(),
      exampleUrl: raw.example_url ?? undefined,
      updatedAt: raw.updated_at.toISOString(),
      trainingId: raw.training_id,
      description: raw.description ?? undefined,
      name: raw.name,
    };

    return mapAndValidateEntity(ExerciseDto, instance);
  };

  fromEntityToPersistence = (entity: ExerciseEntity): ExerciseRawData['selectable'] => {
    return {
      id: entity.id,
      name: entity.name,
      training_id: entity.trainingId,
      type: entity.type,
      user_id: entity.userId,
      created_at: new Date(entity.createdAt),
      updated_at: new Date(entity.updatedAt),
      description: entity.description ?? null,
      example_url: entity.exampleUrl ?? null,
    };
  };

  fromDtoToEntity = (dto: ExerciseDto): ExerciseEntity => {
    return new ExerciseEntity(dto);
  };

  fromEntityToDTO = (entity: ExerciseEntity): ExerciseDto => {
    return mapAndValidateEntity(ExerciseDto, entity);
  };
}

export { type ExerciseRawData, ExercisesMapper };
