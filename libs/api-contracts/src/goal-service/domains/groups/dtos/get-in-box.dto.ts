import { Expose, Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';
import { GroupInBoxDto } from './shared/group-in-box.dto';

class ReqData {
  @IsInt()
  userId: number;
}

class GetInBoxGroupReq {
  @Expose()
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class GetInBoxGroupRes {
  @Expose()
  @ValidateNested()
  @Type(() => GroupInBoxDto)
  data: GroupInBoxDto;
}

export { GetInBoxGroupReq, GetInBoxGroupRes };
