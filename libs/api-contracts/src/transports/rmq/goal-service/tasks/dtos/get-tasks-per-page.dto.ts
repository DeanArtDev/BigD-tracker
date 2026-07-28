import { SortDirection } from '@/shared';
import { GroupTaskOrder } from '@/transports/rmq/goal-service/groups';
import { PaginationQueryDto } from '@/transports/rmq/shared/dto';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { TaskStatus } from '../types';
import { TaskDto } from './task.dto';

class GetTasksPerPageSortDto {
  @IsOptional()
  @IsEnum(SortDirection)
  priority?: SortDirection;

  @IsOptional()
  @IsEnum(SortDirection)
  deadline?: SortDirection;

  @IsOptional()
  @IsEnum(SortDirection)
  startDate?: SortDirection;
}

class GetTasksPerPageFilterDto {
  @IsOptional()
  @IsBoolean()
  recurring?: boolean;

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

  @IsOptional()
  @Type(() => Number)
  @IsArray()
  @IsInt({ each: true })
  groupIds?: number[];

  @IsOptional()
  @Type(() => String)
  @IsArray()
  @IsString({ each: true })
  ids?: string[];
}

class GetTasksPerPageReqData extends PaginationQueryDto {
  @IsInt()
  userId: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(GroupTaskOrder)
  order?: GroupTaskOrder;

  @IsOptional()
  @ValidateNested()
  @Type(() => GetTasksPerPageSortDto)
  sort?: GetTasksPerPageSortDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => GetTasksPerPageFilterDto)
  filter?: GetTasksPerPageFilterDto;
}

class GetTasksPerPageReq {
  @Type(() => GetTasksPerPageReqData)
  @ValidateNested({ each: true })
  data: GetTasksPerPageReqData;
}

class GetTasksPerPageResMeta {
  @IsBoolean()
  nextPage: boolean;
}

class GetTasksPerPageResData {
  @Type(() => TaskDto)
  @ValidateNested({ each: true })
  @IsArray()
  items: TaskDto[];

  @ValidateNested()
  @Type(() => GetTasksPerPageResMeta)
  meta: GetTasksPerPageResMeta;
}

class GetTasksPerPageRes {
  @ValidateNested({ each: true })
  @Type(() => GetTasksPerPageResData)
  data: GetTasksPerPageResData;
}

export { GetTasksPerPageReq, GetTasksPerPageRes };
