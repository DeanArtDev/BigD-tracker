import { Type } from 'class-transformer';
import { IsInt, IsISO8601, IsOptional, IsString, ValidateNested } from 'class-validator';
import { TaskDto } from './thing.dto';

class ReplaceTaskReqData {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsInt()
  userId: number;

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
  description?: string;

  @IsOptional()
  @IsString()
  recurrence?: string;
}

class ReplaceTaskReq {
  @ValidateNested()
  @Type(() => ReplaceTaskReqData)
  data: ReplaceTaskReqData;
}

class ReplaceTaskRes {
  @ValidateNested()
  @Type(() => TaskDto)
  data: TaskDto;
}

export { ReplaceTaskRes, ReplaceTaskReq };
