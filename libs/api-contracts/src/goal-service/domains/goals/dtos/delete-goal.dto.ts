import { Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';

class ReqData {
  @IsInt()
  id: number;

  @IsInt()
  userId: number;
}

class DeleteGoalReq {
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class ResData {
  @IsInt()
  id: number;
}

class DeleteGoalRes {
  @ValidateNested()
  @Type(() => ResData)
  data: ResData;
}

export { DeleteGoalRes, DeleteGoalReq };
