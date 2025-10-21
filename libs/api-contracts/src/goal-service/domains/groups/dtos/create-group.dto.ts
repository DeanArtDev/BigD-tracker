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
  @IsString()
  @IsOptional()
  startDate?: string;

  @IsISO8601()
  @IsString()
  @IsOptional()
  deadline?: string;
}

class ReqData {
  @IsInt()
  userId: number;

  @MaxLength(255)
  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  goalId?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Thing)
  things: Thing[];
}

class CreateGroupReq {
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class CreateGroupRes extends GroupResSingle {}

export { CreateGroupReq, CreateGroupRes };
