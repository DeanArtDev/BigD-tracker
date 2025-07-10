import { GoalEntity } from '@/modules/goals/domain';
import { GoalDto } from '@big-d/api-contracts';
import { BaseMapper } from '@big-d/api-utils';
import { Injectable } from '@nestjs/common';

@Injectable()
class GoalsMapper extends BaseMapper<GoalDto, GoalEntity> {
  constructor() {
    super();
  }

  fromEntityToDTO = (entity: GoalEntity): GoalDto => {
    return this.entityToDTO(entity, GoalDto);
  };
}

export { GoalsMapper };
