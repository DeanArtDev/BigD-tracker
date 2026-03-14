import { Type } from 'class-transformer';
import { IsInt, IsString, ValidateNested } from 'class-validator';
import { TaskDto } from './task.dto';

class CloneTaskReqData {
  @IsInt()
  userId: number;

  @IsString()
  taskId: string;
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
