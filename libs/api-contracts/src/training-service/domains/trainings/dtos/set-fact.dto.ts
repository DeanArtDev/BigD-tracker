import { Expose, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { RepetitionFinishType } from '../../repetitions';

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
  factCount: number;

  @Expose()
  @IsString()
  factWeight: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @IsEnum(RepetitionFinishType)
  @Type(() => String)
  @IsString()
  finishType: RepetitionFinishType;
}

class ResDate {
  @Expose()
  @IsInt()
  repetitionId: number;

  @Expose()
  @IsInt()
  trainingId: number;
}

class SetFactReq {
  @Expose()
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class SetFactRes {
  @Expose()
  @ValidateNested()
  @Type(() => ResDate)
  data: ResDate;
}

export { SetFactRes, SetFactReq };
