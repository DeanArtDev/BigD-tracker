import { Type } from 'class-transformer';
import { IsArray, IsInt, IsISO8601, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ThingDto } from './shared/thing.dto';

class GetThingsReqData {
  @IsInt()
  userId: number;

  @IsISO8601()
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsISO8601()
  @IsString()
  to?: string;
}

class GetThingsReq {
  @ValidateNested()
  @Type(() => GetThingsReqData)
  data: GetThingsReqData;
}

class GetThingsRes {
  @ValidateNested({ each: true })
  @Type(() => ThingDto)
  @IsArray()
  data: ThingDto[];
}

export { GetThingsRes, GetThingsReq };
