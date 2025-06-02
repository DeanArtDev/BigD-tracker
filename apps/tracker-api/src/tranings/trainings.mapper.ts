import { TrainingDto } from '@/tranings/dtos/training.dto';
import { TrainingEntity, TrainingType } from '@/tranings/entities/training.entity';
import { Injectable } from '@nestjs/common';
import { mapAndValidateEntity } from '@shared/lib/map-and-validate-entity';
import { BaseMapper } from '@shared/lib/mapper';
import { DB } from '@shared/modules/db';
import { Selectable } from 'kysely';

type TrainingRawData = Selectable<DB['trainings']>;

@Injectable()
class TrainingsMapper extends BaseMapper<TrainingDto, TrainingEntity, TrainingRawData> {
  fromRaw = (rawData: TrainingRawData): TrainingEntity => {
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

  toEntity = (dto: TrainingDto): TrainingEntity => {
    return new TrainingEntity(dto);
  };

  toDTO = (entity: TrainingEntity): TrainingDto => {
    return mapAndValidateEntity(TrainingDto, entity);
  };
}

export { type TrainingRawData, TrainingsMapper };
