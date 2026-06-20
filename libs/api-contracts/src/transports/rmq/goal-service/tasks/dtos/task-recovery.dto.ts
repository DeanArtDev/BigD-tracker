import { Type } from 'class-transformer';
import { IsInt, IsString, ValidateNested } from 'class-validator';

class TaskRecoveryReqData {
  @IsInt()
  userId: number;

  @IsString()
  taskId: string;

  @IsInt()
  groupId: number;
}

class TaskRecoveryReq {
  @ValidateNested()
  @Type(() => TaskRecoveryReqData)
  data: TaskRecoveryReqData;
}

class TaskRecoveryResData {
  @IsString()
  id: string;
}

class TaskRecoveryRes {
  @ValidateNested()
  @Type(() => TaskRecoveryResData)
  data: TaskRecoveryResData;
}

export { TaskRecoveryReq, TaskRecoveryRes };
