import { TrainingDto } from '@/tranings/dtos/training.dto';
import { Injectable } from '@nestjs/common';
import { mapAndValidateEntity } from '@shared/lib/map-and-validate-entity';
import { BaseMapper } from '@shared/lib/mapper';
import { DB } from '@shared/modules/db';
import { Insertable, Selectable, Updateable } from 'kysely';
import { TrainingEntity, TrainingType } from './entities/training.entity';

type SelectableTrainingRawData = Selectable<DB['trainings']>;
interface TrainingRawData {
  readonly selectable: Selectable<DB['trainings']>;
  readonly updateable: Updateable<DB['trainings']>;
  readonly insertable: Insertable<DB['trainings']>;
}

@Injectable()
class TrainingsMapper extends BaseMapper<TrainingDto, TrainingEntity, SelectableTrainingRawData> {
  fromPersistenceToEntity = (rawData: SelectableTrainingRawData): TrainingEntity => {
    return new TrainingEntity({
      id: rawData.id,
      userId: rawData.user_id,
      name: rawData.name,
      type: rawData.type as TrainingType,
      description: rawData.description ?? undefined,
      startDate: rawData.start_date?.toISOString(),
      endDate: rawData.end_date?.toISOString() ?? undefined,
      wormUpDuration: rawData.worm_up_duration ?? undefined,
      postTrainingDuration: rawData.post_training_duration ?? undefined,
      createdAt: rawData.created_at.toISOString(),
      updatedAt: rawData.created_at.toISOString(),
    });
  };

  fromEntityToPersistence = (entity: TrainingEntity): TrainingRawData['selectable'] => {
    return {
      id: entity.id,
      type: entity.type,
      user_id: entity.userId,
      name: entity.name,
      start_date: new Date(entity.startDate),
      created_at: new Date(entity.createdAt),
      end_date: entity.endDate != null ? new Date(entity.endDate) : null,
      updated_at: new Date(entity.updatedAt),
      description: entity.description ?? null,
      post_training_duration: entity.postTrainingDuration ?? null,
      worm_up_duration: entity.wormUpDuration ?? null,
    };
  };

  fromDtoToEntity = (dto: TrainingDto): TrainingEntity => {
    return new TrainingEntity(dto);
  };

  fromEntityToDTO = (entity: TrainingEntity): TrainingDto => {
    return mapAndValidateEntity(TrainingDto, entity);
  };
}

export { type SelectableTrainingRawData, type TrainingRawData, TrainingsMapper };
