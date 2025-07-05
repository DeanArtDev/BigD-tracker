import { Expose, Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';

class ReqDate {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @IsInt()
  userId: number;
}

class ResDate {
  @Expose()
  @IsInt()
  id: number;
}

class FinishTrainingReq {
  @Expose()
  @ValidateNested()
  @Type(() => ReqDate)
  data: ReqDate;
}

class FinishTrainingRes {
  @Expose()
  @ValidateNested()
  @Type(() => ResDate)
  data: ResDate;
}

export { FinishTrainingReq, FinishTrainingRes };
