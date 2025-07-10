import { ThingEntity } from '@/modules/things/domain';
import { ThingDto } from '@big-d/api-contracts';
import { BaseMapper } from '@big-d/api-utils';
import { Injectable } from '@nestjs/common';

@Injectable()
class ThingsMapper extends BaseMapper<ThingDto, ThingEntity> {
  constructor() {
    super();
  }

  fromEntityToDTO = (entity: ThingEntity): ThingDto => {
    return this.entityToDTO(entity, ThingDto);
  };
}

export { ThingsMapper };
