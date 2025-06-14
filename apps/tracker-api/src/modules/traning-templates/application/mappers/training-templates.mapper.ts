import { TrainingTemplateDto } from '../dtos/training-template.dto';
import { TrainingTemplateEntity } from '../../domain/entities';
import { IMapper } from '@shared/lib/mapper';
import { Injectable } from '@nestjs/common';
import { mapEntity } from '@shared/lib/map-entity';

@Injectable()
class TrainingTemplatesMapper implements IMapper<TrainingTemplateDto, TrainingTemplateEntity> {
  fromEntityToDTO = (entity: TrainingTemplateEntity): TrainingTemplateDto => {
    return mapEntity(TrainingTemplateDto, entity);
  };
}

export { TrainingTemplatesMapper };
