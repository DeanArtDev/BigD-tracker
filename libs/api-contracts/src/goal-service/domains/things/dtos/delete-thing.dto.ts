import { Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';

class ReqData {
  @IsInt()
  id: number;

  @IsInt()
  userId: number;
}

class DeleteThingReq {
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class ResData {
  @IsInt()
  id: number;
}

class DeleteThingRes {
  @ValidateNested()
  @Type(() => ResData)
  data: ResData;
}

export { DeleteThingRes, DeleteThingReq };
