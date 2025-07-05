import { BaseMapper } from '@big-d/api-utils';
import { Injectable } from '@nestjs/common';
import { RepetitionDto } from './dto/repetition.dto';
import { RepetitionEntity } from '../domain/repetition.entity';

@Injectable()
class RepetitionsMapper extends BaseMapper<RepetitionDto, RepetitionEntity> {
  constructor() {
    super();
  }

  fromEntityToDTO = (entity: RepetitionEntity): RepetitionDto => {
    return this.entityToDTO(entity, RepetitionDto);
  };
}

export { RepetitionsMapper };
