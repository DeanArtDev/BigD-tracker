import { Type } from 'class-transformer';
import { IsInt, IsISO8601, IsOptional, IsString, ValidateNested } from 'class-validator';
import { TaskDto } from './task.dto';

class UpdateInboxTaskReqData {
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
