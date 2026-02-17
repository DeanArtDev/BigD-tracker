import { Type } from 'class-transformer';
import { IsArray, IsInt, ValidateNested } from 'class-validator';
import { GroupDto } from './group.dto';

class GetAssignableGroupsReqData {
  @IsInt()
  userId: number;
}

class GetAssignableGroupsReq {
  @ValidateNested()
  @Type(() => GetAssignableGroupsReqData)
  data: GetAssignableGroupsReqData;
}

class GetAssignableGroupsRes {
  @ValidateNested({ each: true })
  @Type(() => GroupDto)
  @IsArray()
  data: GroupDto[];
}

export { GetAssignableGroupsReq, GetAssignableGroupsRes };
