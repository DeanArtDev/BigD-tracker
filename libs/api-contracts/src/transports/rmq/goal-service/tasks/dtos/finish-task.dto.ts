import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { TaskFinishStatus } from '../types';
import { TaskDto } from './task.dto';

class FinishFinishReqData {
  @IsInt()
  userId: number;

  @IsString()
  taskId: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsEnum(TaskFinishStatus)
  type: TaskFinishStatus;
}

class FinishTaskReq {
  @ValidateNested()
  @Type(() => FinishFinishReqData)
  data: FinishFinishReqData;
}

class FinishTaskRes {
  @IsBoolean()
  data: TaskDto;
}

export { FinishTaskReq, FinishTaskRes };
