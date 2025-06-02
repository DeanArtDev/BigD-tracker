import { Injectable } from '@nestjs/common';
import { mapAndValidateEntity } from '@shared/lib/map-and-validate-entity';
import { BaseMapper } from '@shared/lib/mapper';
import { DB } from '@shared/modules/db';
import { Selectable } from 'kysely';
import { ExerciseDto } from './dtos/exercise.dto';
import { ExerciseEntity, ExerciseType } from './entity/exercise.entity';

type ExerciseRawData = Selectable<DB['exercises']>;

@Injectable()
class ExercisesMapper extends BaseMapper<ExerciseDto, ExerciseEntity, ExerciseRawData> {
  fromRaw = (rawData: ExerciseRawData): ExerciseEntity => {
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

  toEntity = (dto: ExerciseDto): ExerciseEntity => {
    return new ExerciseEntity(dto);
  };

  toDTO = (entity: ExerciseEntity): ExerciseDto => {
    return mapAndValidateEntity(ExerciseDto, entity);
  };
}

export { type ExerciseRawData, ExercisesMapper };
