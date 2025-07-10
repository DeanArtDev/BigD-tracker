import { Expose, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsISO8601, IsString, ValidateNested } from 'class-validator';

class ReqData {
  @IsInt()
  id: number;

  @IsInt()
  userId: number;

  @Expose()
  @IsISO8601()
  @IsString()
  endDate: string;
}

class FinishGoalReq {
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class FinishGoalRes {
  @IsBoolean()
  data: boolean;
}

export { FinishGoalRes, FinishGoalReq };
