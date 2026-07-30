import { Type } from 'class-transformer';
import { IsInt, IsString, ValidateNested } from 'class-validator';
import { TaskDto } from './task.dto';

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

class TaskRecoveryRes {
  @ValidateNested()
  @Type(() => TaskDto)
  data: TaskDto;
}

export { TaskRecoveryReq, TaskRecoveryRes };
