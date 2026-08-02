import { Type } from 'class-transformer';
import { IsInt, IsISO8601, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { TaskRecurrencyDto } from './task-recurrency.dto';
import { TaskDto } from './task.dto';

class ReplaceTaskReqData {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsInt()
  userId: number;

  @IsInt()
  priority: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsISO8601()
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsISO8601()
  @IsOptional()
  @IsString()
  deadline?: string;

  @IsOptional()
  @IsObject()
  @Type(() => TaskRecurrencyDto)
  recurrence?: TaskRecurrencyDto;
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
