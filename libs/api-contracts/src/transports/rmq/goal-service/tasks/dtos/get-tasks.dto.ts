import { GroupTaskOrder } from '@/transports/rmq/goal-service/groups';
import { CursorPaginationMetaDto, CursorPaginationDto } from '@/transports/rmq/shared/dto';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { TaskStatus } from '../types';
import { TaskDto } from './task.dto';

class GetTasksFilterDto extends CursorPaginationDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1, { each: true })
  @Max(4, { each: true })
  @IsInt({ each: true })
  @IsArray()
  priority?: number[];

  @IsOptional()
  @Type(() => String)
  @IsArray()
  @IsEnum(TaskStatus, { each: true })
  status?: TaskStatus[];

  @Type(() => Number)
  @IsOptional()
  @IsArray()
  groupIds?: number[];

  @Type(() => String)
  @IsOptional()
  @IsArray()
  ids?: string[];
}

class GetTasksReqData {
  @IsInt()
  userId: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(GroupTaskOrder)
  order?: GroupTaskOrder;

  @Type(() => GetTasksFilterDto)
  @ValidateNested({ each: true })
  filter: GetTasksFilterDto;
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

  @ValidateNested()
  @Type(() => CursorPaginationMetaDto)
  meta: CursorPaginationMetaDto;
}

class GetTasksRes {
  @ValidateNested({ each: true })
  @Type(() => GetTasksResData)
  data: GetTasksResData;
}

export { GetTasksReq, GetTasksRes };
