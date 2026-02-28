import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { TaskRecurrencyDto } from './task-recurrency.dto';
import { TaskDto } from './task.dto';

class ReplaceTaskReqData {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsInt()
  userId: number;

  @IsInt()
  priority: number;

  @IsNumber()
  weight: number;

  @IsOptional()
  @IsString()
  description?: string;

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
