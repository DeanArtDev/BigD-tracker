import { Expose, Type } from 'class-transformer';
import { IsInt, IsISO8601, IsOptional, IsString, ValidateNested } from 'class-validator';
import { TrainingRes } from './shared/training-response.dto';

class ReqData {
  @Expose()
  @IsInt()
  userId: number;

  @Expose()
  @IsISO8601()
  @IsOptional()
  @IsString()
  from?: string;

  @Expose()
  @IsISO8601()
  @IsOptional()
  @IsString()
  to?: string;
}

class GetTrainingsReq {
  @Expose()
  @Type(() => ReqData)
  @ValidateNested()
  data: ReqData;
}

class GetTrainingsRes extends TrainingRes {}

export { GetTrainingsReq, GetTrainingsRes };
