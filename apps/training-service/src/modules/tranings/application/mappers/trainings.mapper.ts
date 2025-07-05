import { TrainingDto } from '@big-d/api-contracts';
import { TrainingEntity } from '@modules/tranings/domain';
import { BaseMapper } from '@big-d/api-utils';
import { Injectable } from '@nestjs/common';

@Injectable()
class TrainingsMapper extends BaseMapper<TrainingDto, TrainingEntity> {
  constructor() {
    super();
  }

  fromEntityToDTO = (entity: TrainingEntity): TrainingDto => {
    return this.entityToDTO(entity, TrainingDto);
  };
}

export { TrainingsMapper };
