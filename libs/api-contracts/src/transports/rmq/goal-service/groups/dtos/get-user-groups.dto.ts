import { GroupDto } from './group.dto';
import { TaskDto } from '@transports/rmq/goal-service/tasks/dtos';
import { Type } from 'class-transformer';
import { IsArray, IsInt, ValidateNested } from 'class-validator';

class GetUserGroupsReqData {
  @IsInt()
  userId: number;
}

class GetUserGroupsReq {
  @ValidateNested()
  @Type(() => GetUserGroupsReqData)
  data: GetUserGroupsReqData;
}

class GetUserGroupsRes {
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => TaskDto)
  data: GroupDto[];
}

export { GetUserGroupsReq, GetUserGroupsRes };
