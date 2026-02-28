import { Type } from 'class-transformer';
import { IsInt, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { TaskRecurrencyDto } from './task-recurrency.dto';
import { TaskDto } from './task.dto';

class CreateTaskInInboxReqData {
  @IsString()
  name: string;

  @IsInt()
  userId: number;

  @IsOptional()
  @IsInt()
  priority?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  @Type(() => TaskRecurrencyDto)
  recurrence?: TaskRecurrencyDto;
}

class CreateTaskInInboxReq {
  @ValidateNested()
  @Type(() => CreateTaskInInboxReqData)
  data: CreateTaskInInboxReqData;
}

class CreateTaskInInboxRes {
  @ValidateNested()
  @Type(() => TaskDto)
  data: TaskDto;
}

export { CreateTaskInInboxReq, CreateTaskInInboxRes };
