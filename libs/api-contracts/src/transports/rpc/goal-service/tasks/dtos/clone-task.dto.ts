import { Type } from 'class-transformer';
import { IsInt, IsOptional, ValidateNested } from 'class-validator';
import { TaskDto } from './thing.dto';

class CloneTaskReqData {
  @IsInt()
  userId: number;

  @IsInt()
  taskId: number;

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
