import { Type } from 'class-transformer';
import { IsInt, IsOptional, ValidateNested } from 'class-validator';

class TaskRecoveryReqData {
  @IsInt()
  userId: number;

  @IsInt()
  taskId: number;

  @IsOptional()
  @IsInt()
  groupId?: number;
}

class TaskRecoveryReq {
  @ValidateNested()
  @Type(() => TaskRecoveryReqData)
  data: TaskRecoveryReqData;
}

class TaskRecoveryResData {
  @IsInt()
  id: number;
}

class TaskRecoveryRes {
  @ValidateNested()
  @Type(() => TaskRecoveryResData)
  data: TaskRecoveryResData;
}

export { TaskRecoveryReq, TaskRecoveryRes };
