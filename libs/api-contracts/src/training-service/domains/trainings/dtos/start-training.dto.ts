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

class StartTrainingReq {
  @Expose()
  @ValidateNested()
  @Type(() => ReqDate)
  data: ReqDate;
}

class StartTrainingRes {
  @Expose()
  @ValidateNested()
  @Type(() => ResDate)
  data: ResDate;
}

export { StartTrainingReq, StartTrainingRes };
