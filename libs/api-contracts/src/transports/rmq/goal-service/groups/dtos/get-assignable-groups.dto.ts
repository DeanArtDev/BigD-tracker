import { GroupInfoDto } from './group-info.dto';
import { Type } from 'class-transformer';
import { IsArray, IsInt, ValidateNested } from 'class-validator';

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
  @Type(() => GroupInfoDto)
  @IsArray()
  data: GroupInfoDto[];
}

export { GetAssignableGroupsReq, GetAssignableGroupsRes };
