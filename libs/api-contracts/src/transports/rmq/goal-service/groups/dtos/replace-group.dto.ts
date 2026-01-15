import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { GroupResSingle } from './group-response.dto';

class ReplaceGroupTask {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  priority: number;

  @IsInt()
  weight: number;

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
  recurrence?: string;
}

class ReplaceGroupReqData {
  @IsInt()
  id: number;

  @IsInt()
  userId: number;

  @MaxLength(255)
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => ReplaceGroupTask)
  tasks: ReplaceGroupTask[];
}

class ReplaceGroupReq {
  @ValidateNested()
  @Type(() => ReplaceGroupReqData)
  data: ReplaceGroupReqData;
}

class ReplaceGroupRes extends GroupResSingle {}

export { ReplaceGroupReq, ReplaceGroupRes };
