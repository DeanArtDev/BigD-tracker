import { SortDirection } from '@/shared';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { TaskStatus } from '../types';
import { TaskDto } from './task.dto';

class GetTasksSortDto {
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

class GetTasksFilterDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(4)
  @IsInt()
  priority?: number;

  @IsOptional()
  @Type(() => Number)
  @IsArray()
  @IsInt({ each: true })
  group?: number[];

  @IsOptional()
  @Type(() => String)
  @IsArray()
  @IsEnum(TaskStatus, { each: true })
  status?: TaskStatus[];

  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;
}

class GetTasksReqData {
  @IsInt()
  userId: number;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  search?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => GetTasksSortDto)
  sort?: GetTasksSortDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => GetTasksFilterDto)
  filter?: GetTasksFilterDto;
}

class GetTasksReq {
  @Type(() => GetTasksReqData)
  @ValidateNested({ each: true })
  data: GetTasksReqData;
}

class GetTasksRes {
  @Type(() => TaskDto)
  @ValidateNested({ each: true })
  @IsArray()
  data: TaskDto[];
}

export { GetTasksReq, GetTasksRes };
