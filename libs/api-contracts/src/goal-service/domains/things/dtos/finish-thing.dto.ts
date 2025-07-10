import { Expose, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class ReqData {
  @IsInt()
  id: number;

  @IsInt()
  userId: number;

  @Expose()
  @IsISO8601()
  @IsString()
  endDate: string;

  @Expose()
  @IsOptional()
  @IsString()
  comment?: string;

  @Expose()
  @IsInt()
  @Min(0)
  @Max(100)
  result: number;
}

class FinishThingReq {
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class FinishThingRes {
  @IsBoolean()
  data: boolean;
}

export { FinishThingRes, FinishThingReq };
