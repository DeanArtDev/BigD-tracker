import { Type } from 'class-transformer';
import { IsInt, Min, ValidateNested } from 'class-validator';

class GetGroupInfoReqData {
  @IsInt()
  groupId: number;

  @IsInt()
  userId: number;
}

class GetGroupInfoReq {
  @ValidateNested()
  @Type(() => GetGroupInfoReqData)
  data: GetGroupInfoReqData;
}

class GetGroupInfoResData {
  @Min(0)
  @IsInt()
  taskCount: number;
}

class GetGroupInfoRes {
  @ValidateNested()
  @Type(() => GetGroupInfoResData)
  data: GetGroupInfoResData;
}

export { GetGroupInfoReq, GetGroupInfoRes };
