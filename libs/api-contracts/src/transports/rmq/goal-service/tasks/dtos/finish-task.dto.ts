import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { TaskFinishStatus } from '../types';

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
  data: boolean;
}

export { FinishTaskReq, FinishTaskRes };
