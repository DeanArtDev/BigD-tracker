import { Type } from 'class-transformer';
import { IsInt, IsString, ValidateNested } from 'class-validator';
import { TaskDto } from './task.dto';

class AssignTaskToGroupReqData {
  @IsInt()
  userId: number;

  @IsInt()
  groupId: number;

  @IsString()
  taskId: string;
}

class AssignTaskToGroupReq {
  @ValidateNested()
  @Type(() => AssignTaskToGroupReqData)
  data: AssignTaskToGroupReqData;
}

class AssignTaskToGroupRes {
  @ValidateNested()
  @Type(() => TaskDto)
  data: TaskDto;
}

export { AssignTaskToGroupReq, AssignTaskToGroupRes };
