import { Type } from 'class-transformer';
import { IsInt, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { TaskRecurrencyDto } from './task-recurrency.dto';
import { TaskDto } from './task.dto';

class CreateTaskReqData {
  @IsString()
  name: string;

  @IsInt()
  userId: number;

  @IsInt()
  @IsOptional()
  groupId?: number;

  @IsOptional()
  @IsInt()
  priority?: number;

  @IsOptional()
  @IsInt()
  weight?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  @Type(() => TaskRecurrencyDto)
  recurrence?: TaskRecurrencyDto;
}

class CreateTaskReq {
  @ValidateNested()
  @Type(() => CreateTaskReqData)
  data: CreateTaskReqData;
}

class CreateTaskRes {
  @ValidateNested()
  @Type(() => TaskDto)
  data: TaskDto;
}

export { CreateTaskReq, CreateTaskRes };
