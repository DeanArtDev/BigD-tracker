import { Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';

class ReqData {
  @IsInt()
  id: number;

  @IsInt()
  userId: number;
}

class DeleteGroupReq {
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class ResData {
  @IsInt()
  id: number;
}

class DeleteGroupRes {
  @ValidateNested()
  @Type(() => ResData)
  data: ResData;
}

export { DeleteGroupRes, DeleteGroupReq };
