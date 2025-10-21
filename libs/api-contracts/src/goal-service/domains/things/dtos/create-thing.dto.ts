import { Expose, Type } from 'class-transformer';
import {
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ThingDto } from '../../things';

class ReqData {
  @MaxLength(255)
  @IsString()
  name: string;

  @IsInt()
  userId: number;

  @IsInt()
  groupId: number;

  @IsOptional()
  @Min(1)
  @Max(4)
  @IsInt()
  priority?: number;

  @IsISO8601()
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsISO8601()
  @IsOptional()
  @IsString()
  deadline?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

class CreateThingReq {
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class CreateThingRes {
  @Expose()
  @ValidateNested()
  @Type(() => ThingDto)
  data: ThingDto;
}

export { CreateThingReq, CreateThingRes };
