import { Expose, Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';

class ReqData {
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

class DeleteTrainingReq {
  @Expose()
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class DeleteTrainingRes {
  @Expose()
  @ValidateNested()
  @Type(() => ResDate)
  data: ResDate;
}

export { DeleteTrainingRes, DeleteTrainingReq };
