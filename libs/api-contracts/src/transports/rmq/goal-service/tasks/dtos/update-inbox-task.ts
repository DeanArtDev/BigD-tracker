import { Type } from 'class-transformer';
import { IsInt, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { TaskRecurrencyDto } from './task-recurrency.dto';
import { TaskDto } from './task.dto';

class UpdateInboxTaskReqData {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsInt()
  userId: number;

  @IsInt()
  priority: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  @Type(() => TaskRecurrencyDto)
  recurrence?: TaskRecurrencyDto;
}

class UpdateInboxTaskReq {
  @ValidateNested()
  @Type(() => UpdateInboxTaskReqData)
  data: UpdateInboxTaskReqData;
}

class UpdateInboxTaskRes {
  @ValidateNested()
  @Type(() => TaskDto)
  data: TaskDto;
}

export { UpdateInboxTaskRes, UpdateInboxTaskReq };
