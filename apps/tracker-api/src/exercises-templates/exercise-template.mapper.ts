import { PutExerciseTemplateRequest } from '@/exercises-templates/dtos/put-exercise-template.dto';
import { Injectable } from '@nestjs/common';
import { mapAndValidateEntity } from '@shared/lib/map-and-validate-entity';
import { BaseMapper } from '@shared/lib/mapper';
import { Override } from '@shared/lib/type-helpers';
import { DB } from '@shared/modules/db';
import { Selectable } from 'kysely';
import { Insertable, Updateable } from 'kysely/dist/esm';
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
  ExerciseTemplateRawData['selectable']
> {
  fromPersistenceToEntity = (
    rawData: ExerciseTemplateRawData['selectable'],
  ): ExerciseTemplateEntity => {
    return new ExerciseTemplateEntity({
      id: rawData.id,
      name: rawData.name,
      type: rawData.type as ExerciseType,
      createdAt: rawData.created_at.toISOString(),
      updatedAt: rawData.updated_at.toISOString(),
      userId: rawData.user_id ?? undefined,
      description: rawData.description ?? undefined,
      exampleUrl: rawData.example_url ?? undefined,
    });
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

  fromDtoToEntity = (dto: ExerciseTemplateDto): ExerciseTemplateEntity => {
    return new ExerciseTemplateEntity(dto);
  };

  fromEntityToDTO = (entity: ExerciseTemplateEntity): ExerciseTemplateDto => {
    return mapAndValidateEntity(ExerciseTemplateDto, entity);
  };

  fromUpdateDtoToRaw = (
    dto: PutExerciseTemplateRequest['data'][0],
  ): Override<ExerciseTemplateRawData['updateable'], 'id', number> => {
    return {
      id: dto.id,
      type: dto.type,
      name: dto.name,
      user_id: undefined,
      example_url: dto.exampleUrl,
      description: dto.description,
    };
  };

  fromPersistenceToDto = (raw: ExerciseTemplateRawData['selectable']): ExerciseTemplateDto => {
    const instance: ExerciseTemplateDto = {
      id: raw.id,
      name: raw.name,
      type: raw.type as ExerciseType,
      createdAt: raw.created_at.toISOString(),
      updatedAt: raw.updated_at.toISOString(),
      userId: raw.user_id ?? undefined,
      description: raw.description ?? undefined,
      exampleUrl: raw.example_url ?? undefined,
    };

    return mapAndValidateEntity(ExerciseTemplateDto, instance);
  };
}

export { type ExerciseTemplateRawData, ExercisesTemplateMapper };
