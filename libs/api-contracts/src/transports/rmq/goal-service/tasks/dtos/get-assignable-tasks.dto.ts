import { TaskDto } from './task.dto';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

class GetAssignableTasksReqData {
  @IsInt()
  userId: number;

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  groupIds?: number[];

  @IsString()
  search: string;
}

class GetAssignableTasksReq {
  @Type(() => GetAssignableTasksReqData)
  @ValidateNested()
  data: GetAssignableTasksReqData;
}

class GetAssignableTasksRes {
  @ValidateNested({ each: true })
  @Type(() => TaskDto)
  @IsArray()
  data: TaskDto[];
}

export { GetAssignableTasksReq, GetAssignableTasksRes };
