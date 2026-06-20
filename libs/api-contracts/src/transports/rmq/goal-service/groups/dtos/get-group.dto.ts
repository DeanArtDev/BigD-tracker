import { Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';
import { GroupDto } from './group.dto';

class GetGroupReqData {
  @IsInt()
  groupId: number;

  @IsInt()
  userId: number;
}

class GetGroupReq {
  @ValidateNested()
  @Type(() => GetGroupReqData)
  data: GetGroupReqData;
}

class GetGroupRes {
  @ValidateNested()
  @Type(() => GroupDto)
  data: GroupDto;
}

export { GetGroupReq, GetGroupRes };
