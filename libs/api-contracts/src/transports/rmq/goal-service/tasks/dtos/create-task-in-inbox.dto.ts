import { Type } from 'class-transformer';
import { IsInt, IsISO8601, IsOptional, IsString, ValidateNested } from 'class-validator';
import { TaskDto } from './task.dto';

class CreateTaskInInboxReqData {
  @IsString()
  name: string;

  @IsInt()
  userId: number;

  @IsOptional()
  @IsInt()
  priority?: number;

  @IsISO8601()
  @IsOptional()
  @IsString()
  deadline?: string;

  @IsOptional()
  @IsString()
  description?: string;
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
