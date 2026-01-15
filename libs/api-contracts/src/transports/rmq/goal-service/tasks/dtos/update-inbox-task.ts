import { Type } from 'class-transformer';
import { IsInt, IsISO8601, IsOptional, IsString, ValidateNested } from 'class-validator';
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

  @IsISO8601()
  @IsOptional()
  @IsString()
  deadline?: string;

  @IsOptional()
  @IsString()
  description?: string;
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
