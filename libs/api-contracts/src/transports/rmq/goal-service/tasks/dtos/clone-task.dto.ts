import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { TaskDto } from './task.dto';

class CloneTaskReqData {
  @IsInt()
  userId: number;

  @IsString()
  taskId: string;

  @IsInt()
  @IsOptional()
  groupId?: number;
}

class CloneTaskReq {
  @ValidateNested()
  @Type(() => CloneTaskReqData)
  data: CloneTaskReqData;
}

class CloneTaskRes {
  @ValidateNested()
  @Type(() => TaskDto)
  data: TaskDto;
}

export { CloneTaskReq, CloneTaskRes };
