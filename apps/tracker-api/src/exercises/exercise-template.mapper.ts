import { Injectable } from '@nestjs/common';
import { mapAndValidateEntity } from '@shared/lib/map-and-validate-entity';
import { BaseMapper } from '@shared/lib/mapper';
import { DB } from '@shared/modules/db';
import { Selectable } from 'kysely';
import { ExerciseTemplateDto } from './dtos/exercise-template.dto';
import { ExerciseTemplateEntity } from './entity/exercise-template.entity';
import { ExerciseType } from './entity/exercise.entity';

type ExerciseRawData = Selectable<DB['exercises_templates']>;

@Injectable()
export class ExercisesTemplateMapper extends BaseMapper<
  ExerciseTemplateDto,
  ExerciseTemplateEntity,
  ExerciseRawData
> {
  fromPersistenceToEntity = (rawData: ExerciseRawData): ExerciseTemplateEntity => {
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

  fromDtoToEntity = (dto: ExerciseTemplateDto): ExerciseTemplateEntity => {
    return new ExerciseTemplateEntity(dto);
  };

  fromEntityToDTO = (entity: ExerciseTemplateEntity): ExerciseTemplateDto => {
    return mapAndValidateEntity(ExerciseTemplateDto, entity);
  };
}
