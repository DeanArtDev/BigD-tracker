import { Type } from 'class-transformer';
import { IsInt, IsString, ValidateNested } from 'class-validator';

class GetInBoxGroupReqData {
  @IsInt()
  userId: number;
}

class GetInBoxGroupReq {
  @ValidateNested()
  @Type(() => GetInBoxGroupReqData)
  data: GetInBoxGroupReqData;
}

class GetInBoxGroupResData {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsInt()
  taskCount: number;
}

class GetInBoxGroupRes {
  @ValidateNested()
  @Type(() => GetInBoxGroupResData)
  data: GetInBoxGroupResData;
}

export { GetInBoxGroupReq, GetInBoxGroupRes };
