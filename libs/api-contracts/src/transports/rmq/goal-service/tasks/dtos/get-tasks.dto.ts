import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, ValidateNested } from 'class-validator';
import { TaskDto } from './task.dto';

class GetTasksReqData {
  @IsInt()
  userId: number;

  @Type(() => Number)
  @IsOptional()
  @IsArray()
  groupIds?: number[];

  @Type(() => String)
  @IsOptional()
  @IsArray()
  ids?: string[];
}

class GetTasksReq {
  @Type(() => GetTasksReqData)
  @ValidateNested({ each: true })
  data: GetTasksReqData;
}

class GetTasksResData {
  @Type(() => TaskDto)
  @ValidateNested({ each: true })
  @IsArray()
  items: TaskDto[];
}

class GetTasksRes {
  @ValidateNested({ each: true })
  @Type(() => GetTasksResData)
  data: GetTasksResData;
}

export { GetTasksReq, GetTasksRes };
