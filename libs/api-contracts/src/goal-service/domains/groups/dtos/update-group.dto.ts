import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { GroupResSingle } from './shared/group-response.dto';

class Thing {
  @IsInt()
  @IsOptional()
  id?: number;

  @MaxLength(255)
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0)
  @Max(4)
  priority?: number;

  @IsISO8601()
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsISO8601()
  @IsOptional()
  @IsString()
  deadline?: string;
}

class ReqData {
  @IsInt()
  id: number;

  @IsInt()
  userId: number;

  @MaxLength(255)
  @IsString()
  name: string;

  @IsInt()
  @IsOptional()
  goalId?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Thing)
  things: Thing[];
}

class UpdateGroupReq {
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class UpdateGroupRes extends GroupResSingle {}

export { UpdateGroupReq, UpdateGroupRes };
