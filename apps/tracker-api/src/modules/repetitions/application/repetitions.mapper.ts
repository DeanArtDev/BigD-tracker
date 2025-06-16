import { Injectable } from '@nestjs/common';
import { mapEntity } from '@shared/lib/map-entity';
import { IMapper } from '@shared/lib/mapper';
import { RepetitionDto } from './dto/repetition.dto';
import { RepetitionEntity } from '../domain/repetition.entity';

@Injectable()
class RepetitionsMapper implements IMapper<RepetitionDto, RepetitionEntity> {
  fromEntityToDTO = (entity: RepetitionEntity): RepetitionDto => {
    return mapEntity(RepetitionDto, entity);
  };
}

export { RepetitionsMapper };
