import { Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';
import { GroupDetailedDto } from './group-detailed.dto';

class GetDetailedGroupsReqData {
  @IsInt()
  groupId: number;

  @IsInt()
  userId: number;
}

class GetDetailedGroupsReq {
  @ValidateNested()
  @Type(() => GetDetailedGroupsReqData)
  data: GetDetailedGroupsReqData;
}

class GetDetailedGroupsRes {
  @ValidateNested()
  @Type(() => GroupDetailedDto)
  data: GroupDetailedDto;
}

export { GetDetailedGroupsReq, GetDetailedGroupsRes };
