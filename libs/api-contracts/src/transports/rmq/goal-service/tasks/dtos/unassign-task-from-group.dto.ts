import { Type } from 'class-transformer';
import { IsInt, IsString, ValidateNested } from 'class-validator';
import { TaskDto } from './task.dto';

class UnassignTaskFromGroupReqData {
  @IsInt()
  userId: number;

  @IsInt()
  groupId: number;

  @IsString()
  taskId: string;
}

class UnassignTaskFromGroupReq {
  @ValidateNested()
  @Type(() => UnassignTaskFromGroupReqData)
  data: UnassignTaskFromGroupReqData;
}

class UnassignTaskFromGroupRes {
  @ValidateNested()
  @Type(() => TaskDto)
  data: TaskDto;
}

export { UnassignTaskFromGroupReq, UnassignTaskFromGroupRes };
