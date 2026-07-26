import { Type } from 'class-transformer';
import { IsInt, IsString, ValidateNested } from 'class-validator';
import { TaskDto } from './task.dto';

class DeleteTaskReqData {
  @IsString()
  taskId: string;

  @IsInt()
  userId: number;
}

class DeleteTaskReq {
  @ValidateNested()
  @Type(() => DeleteTaskReqData)
  data: DeleteTaskReqData;
}

class DeleteTaskRes {
  @ValidateNested()
  @Type(() => TaskDto)
  data: TaskDto;
}

export { DeleteTaskRes, DeleteTaskReq };
