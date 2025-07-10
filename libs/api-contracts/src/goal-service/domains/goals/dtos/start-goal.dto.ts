import { Expose, Type } from 'class-transformer';
import { IsInt, ValidateNested, IsBoolean, IsISO8601, IsString } from 'class-validator';

class ReqData {
  @IsInt()
  id: number;

  @IsInt()
  userId: number;

  @Expose()
  @IsISO8601()
  @IsString()
  deadline: string;

  @Expose()
  @IsISO8601()
  @IsString()
  startDate: string;
}

class StartGoalReq {
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class StartGoalRes {
  @IsBoolean()
  data: boolean;
}

export { StartGoalRes, StartGoalReq };
