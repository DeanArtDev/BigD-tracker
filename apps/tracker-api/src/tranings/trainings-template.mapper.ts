import { TrainingTemplateDto } from '@/tranings/dtos/training-template.dto';
import { Injectable } from '@nestjs/common';
import { mapAndValidateEntity } from '@shared/lib/map-and-validate-entity';
import { BaseMapper } from '@shared/lib/mapper';
import { DB } from '@shared/modules/db';
import { Insertable, Selectable, Updateable } from 'kysely';
import { TrainingTemplateEntity } from './entities/training-template.entity';
import { TrainingType } from './entities/training.entity';

interface TrainingTemplateRawData {
  readonly selectable: Selectable<DB['trainings_templates']>;
  readonly updateable: Updateable<DB['trainings_templates']>;
  readonly insertable: Insertable<DB['trainings_templates']>;
}

@Injectable()
class TrainingsTemplatesMapper extends BaseMapper<
  TrainingTemplateDto,
  TrainingTemplateEntity,
  TrainingTemplateRawData['selectable']
> {
  fromPersistenceToEntity = (
    rawData: TrainingTemplateRawData['selectable'],
  ): TrainingTemplateEntity => {
    return new TrainingTemplateEntity({
      id: rawData.id,
      userId: rawData.user_id ?? undefined,
      name: rawData.name,
      type: rawData.type as TrainingType,
      description: rawData.description ?? undefined,
      wormUpDuration: rawData.worm_up_duration ?? undefined,
      postTrainingDuration: rawData.post_training_duration ?? undefined,
      createdAt: rawData.created_at.toISOString(),
      updatedAt: rawData.created_at.toISOString(),
    });
  };

  fromEntityToPersistence = (
    entity: TrainingTemplateEntity,
  ): TrainingTemplateRawData['selectable'] => {
    return {
      id: entity.id,
      type: entity.type,
      name: entity.name,
      created_at: new Date(entity.createdAt),
      updated_at: new Date(entity.updatedAt),
      user_id: entity.userId ?? null,
      description: entity.description ?? null,
      post_training_duration: entity.postTrainingDuration ?? null,
      worm_up_duration: entity.wormUpDuration ?? null,
    };
  };

  fromDtoToEntity = (dto: TrainingTemplateDto): TrainingTemplateEntity => {
    return new TrainingTemplateEntity(dto);
  };

  fromEntityToDTO = (entity: TrainingTemplateEntity): TrainingTemplateDto => {
    return mapAndValidateEntity(TrainingTemplateDto, entity);
  };
}

export { type TrainingTemplateRawData, TrainingsTemplatesMapper };
