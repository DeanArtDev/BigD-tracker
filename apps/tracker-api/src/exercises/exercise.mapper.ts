import { Injectable } from '@nestjs/common';
import { mapAndValidateEntity } from '@shared/lib/map-and-validate-entity';
import { BaseMapper } from '@shared/lib/mapper';
import { DB } from '@shared/modules/db';
import { Insertable, Selectable, Updateable } from 'kysely';
import { ExerciseDto } from './dtos/exercise.dto';
import { ExerciseTemplateEntity, ExerciseType } from './entity/exercise-template.entity';
import { ExerciseTemplateRawData } from './exercise-template.mapper';

interface ExerciseRawData {
  readonly selectable: Selectable<DB['exercises']>;
  readonly updateable: Updateable<DB['exercises']>;
  readonly insertable: Insertable<DB['exercises']>;
}

@Injectable()
class ExercisesMapper extends BaseMapper<
  ExerciseDto,
  ExerciseTemplateEntity,
  ExerciseRawData['selectable']
> {
  fromPersistenceToEntity = (rawData: ExerciseRawData['selectable']): ExerciseTemplateEntity => {
    return new ExerciseTemplateEntity({
      id: rawData.id,
      name: rawData.name,
      userId: rawData.user_id,
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
      description: raw.description ?? undefined,
      name: raw.name,
    };

    return mapAndValidateEntity(ExerciseDto, instance);
  };

  fromEntityToPersistence = (
    entity: ExerciseTemplateEntity,
  ): ExerciseTemplateRawData['selectable'] => {
    return {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      created_at: new Date(entity.createdAt),
      updated_at: new Date(entity.updatedAt),
      user_id: entity.userId ?? null,
      description: entity.description ?? null,
      example_url: entity.exampleUrl ?? null,
    };
  };

  fromDtoToEntity = (dto: ExerciseDto): ExerciseTemplateEntity => {
    return new ExerciseTemplateEntity(dto);
  };

  fromEntityToDTO = (entity: ExerciseTemplateEntity): ExerciseDto => {
    return mapAndValidateEntity(ExerciseDto, entity);
  };
}

export { type ExerciseRawData, ExercisesMapper };
