import { Type } from 'class-transformer';
import { IsArray, IsInt, ValidateNested } from 'class-validator';
import { GroupDto } from './group.dto';

class GetDiaryGroupListReqData {
  @IsInt()
  userId: number;
}

class GetDiaryGroupListReq {
  @ValidateNested()
  @Type(() => GetDiaryGroupListReqData)
  data: GetDiaryGroupListReqData;
}

class GetDiaryGroupListRes {
  @ValidateNested({ each: true })
  @Type(() => GroupDto)
  @IsArray()
  data: GroupDto[];
}

export { GetDiaryGroupListReq, GetDiaryGroupListRes };
