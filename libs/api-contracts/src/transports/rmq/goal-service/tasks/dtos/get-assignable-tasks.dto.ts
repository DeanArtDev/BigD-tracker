import { TaskDto } from './task.dto';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsString, ValidateNested } from 'class-validator';

class GetAssignableTasksReqData {
  @IsInt()
  userId: number;

  @IsInt()
  groupId: number;

  @IsString()
  search: string;
}

class GetAssignableTasksToGroupReq {
  @Type(() => GetAssignableTasksReqData)
  @ValidateNested()
  data: GetAssignableTasksReqData;
}

class GetAssignableTasksToGroupRes {
  @ValidateNested({ each: true })
  @Type(() => TaskDto)
  @IsArray()
  data: TaskDto[];
}

export { GetAssignableTasksToGroupReq, GetAssignableTasksToGroupRes };
