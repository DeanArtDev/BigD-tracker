import { Expose, Type } from 'class-transformer';
import { IsInt, ValidateNested, IsArray } from 'class-validator';
import { GroupDto } from './shared/group.dto';

class ReqData {
  @IsInt()
  userId: number;
}

class GetGroupsByUserIdReq {
  @Expose()
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class GetGroupsByUserIdRes {
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => GroupDto)
  @IsArray()
  data: GroupDto[];
}

export { GetGroupsByUserIdReq, GetGroupsByUserIdRes };
