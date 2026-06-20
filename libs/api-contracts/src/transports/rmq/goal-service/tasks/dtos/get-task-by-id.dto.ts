import { Type } from 'class-transformer';
import { IsInt, IsString, ValidateNested } from 'class-validator';
import { TaskDto } from './task.dto';

class GetTaskByIdReqData {
  @IsInt()
  userId: number;

  @IsString()
  taskId: string;
}

class GetTaskByIdReq {
  @ValidateNested()
  @Type(() => GetTaskByIdReqData)
  data: GetTaskByIdReqData;
}

class GetTaskByIdRes {
  @ValidateNested()
  @Type(() => TaskDto)
  data: TaskDto;
}

export { GetTaskByIdReq, GetTaskByIdRes };
