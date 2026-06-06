import { SortDirection } from '@/shared';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
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
import { PaginationQueryDto } from '@/transports/rmq/shared/dto';

class GetTasksByRangeSortDto {
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

class GetTasksByRangeFilterDto {
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

class GetTasksByRangeReqData extends PaginationQueryDto {
  @IsInt()
  userId: number;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  search?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => GetTasksByRangeSortDto)
  sort?: GetTasksByRangeSortDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => GetTasksByRangeFilterDto)
  filter?: GetTasksByRangeFilterDto;
}

class GetTasksByRangeReq {
  @Type(() => GetTasksByRangeReqData)
  @ValidateNested({ each: true })
  data: GetTasksByRangeReqData;
}

class GetTasksByRangeResMeta {
  @IsBoolean()
  nextPage: boolean;
}

class GetTasksByRangeResData {
  @Type(() => TaskDto)
  @ValidateNested({ each: true })
  @IsArray()
  items: TaskDto[];

  @ValidateNested()
  @Type(() => GetTasksByRangeResMeta)
  meta: GetTasksByRangeResMeta;
}

class GetTasksByRangeRes {
  @ValidateNested({ each: true })
  @Type(() => GetTasksByRangeResData)
  data: GetTasksByRangeResData;
}

export { GetTasksByRangeReq, GetTasksByRangeRes };
