import { BaseMapper } from '@big-d/api-utils';
import { TrainingTemplateDto } from '@big-d/api-contracts';
import { TrainingTemplateEntity } from '../../domain/entities';
import { Injectable } from '@nestjs/common';

@Injectable()
class TrainingTemplatesMapper extends BaseMapper<TrainingTemplateDto, TrainingTemplateEntity> {
  fromEntityToDTO = (entity: TrainingTemplateEntity): TrainingTemplateDto => {
    return this.entityToDTO(entity, TrainingTemplateDto);
  };
}

export { TrainingTemplatesMapper };
