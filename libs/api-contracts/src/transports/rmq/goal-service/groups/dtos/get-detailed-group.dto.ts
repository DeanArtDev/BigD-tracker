import { Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';
import { GroupDetailedDto } from './group-detailed.dto';

class GetDetailedGroupReqData {
  @IsInt()
  groupId: number;

  @IsInt()
  userId: number;
}

class GetDetailedGroupReq {
  @ValidateNested()
  @Type(() => GetDetailedGroupReqData)
  data: GetDetailedGroupReqData;
}

class GetDetailedGroupRes {
  @ValidateNested()
  @Type(() => GroupDetailedDto)
  data: GroupDetailedDto;
}

export { GetDetailedGroupReq, GetDetailedGroupRes };
