import { Expose, Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';

class ReqData {
  @Expose()
  @IsInt()
  repetitionId: number;

  @Expose()
  @IsInt()
  trainingId: number;

  @Expose()
  @IsInt()
  userId: number;

  @Expose()
  @IsInt()
  factBreak: number;
}

class ResDate {
  @Expose()
  @IsInt()
  repetitionId: number;

  @Expose()
  @IsInt()
  trainingId: number;
}

class SetBreakFactReq {
  @Expose()
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class SetBreakFactRes {
  @Expose()
  @ValidateNested()
  @Type(() => ResDate)
  data: ResDate;
}

export { SetBreakFactRes, SetBreakFactReq };
