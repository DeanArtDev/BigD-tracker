import { GroupEntity } from '@/modules/groups/domain';
import { GroupDto, GroupInBoxDto } from '@big-d/api-contracts';
import { BaseMapper } from '@big-d/api-utils';
import { Injectable } from '@nestjs/common';

@Injectable()
class GroupsMapper extends BaseMapper<GroupDto, GroupEntity> {
  constructor() {
    super();
  }

  fromEntityToDTO = (entity: GroupEntity): GroupDto => {
    return this.entityToDTO(entity, GroupDto);
  };
}

class InBoxGroupMapper extends BaseMapper<GroupInBoxDto, GroupEntity> {
  constructor() {
    super();
  }

  fromEntityToDTO = (entity: GroupEntity): GroupInBoxDto => {
    return this.entityToDTO(entity, GroupInBoxDto);
  };
}

export { GroupsMapper, InBoxGroupMapper };
