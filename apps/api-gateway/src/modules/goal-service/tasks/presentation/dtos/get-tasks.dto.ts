import { SortDirection, TaskStatus } from '@big-d/api-contracts';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto, PaginationResDto } from '@shared/dto';
import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  Validate,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { TaskDto } from './task.dto';

const AllowedTaskStatuses = [
  TaskStatus.NOT_STARTED,
  TaskStatus.IN_PROGRESS,
  TaskStatus.COMPLETED,
  TaskStatus.OVERDUE,
  TaskStatus.CANCELLED,
] as const;

@ValidatorConstraint({ name: 'BothOrNothing', async: false })
class BothOrNothing implements ValidatorConstraintInterface {
  validate(filter: any) {
    if (!filter || typeof filter !== 'object') return true;
    if (filter.from == null && filter.to == null) {
      return true;
    }

    const hasFrom = filter.from !== undefined;
    const hasTo = filter.to !== undefined;

    return hasFrom && hasTo;
  }

  defaultMessage() {
    return 'filter.from и filter.to должны быть переданы либо оба вместе, либо оба отсутствовать';
  }
}

class GetTasksSortDto {
  @ApiPropertyOptional({
    description: 'Сортировка по приоритету',
    example: SortDirection.ASC,
    enum: SortDirection,
  })
  @Expose()
  @IsOptional()
  @IsEnum(SortDirection)
  priority?: SortDirection;

  @ApiPropertyOptional({
    description: 'Сортировка по дедлайну',
    example: SortDirection.ASC,
    enum: SortDirection,
  })
  @Expose()
  @IsOptional()
  @IsEnum(SortDirection)
  deadline?: SortDirection;

  @ApiPropertyOptional({
    description: 'Сортировка по дате старта',
    example: SortDirection.ASC,
    enum: SortDirection,
  })
  @Expose()
  @IsOptional()
  @IsEnum(SortDirection)
  startDate?: SortDirection;
}

class GetTasksFilterDto {
  @ApiPropertyOptional({
    description: 'Приоритет фильтрации',
    example: 2,
  })
  @Expose()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(4)
  @IsInt()
  priority?: number;

  @ApiPropertyOptional({
    description: 'IDs групп',
    type: Number,
    example: [1, 2, 3],
    isArray: true,
  })
  @Expose()
  @IsOptional()
  @Type(() => Number)
  @IsArray()
  @IsNotEmpty()
  @IsInt({ each: true })
  group?: number[];

  @ApiPropertyOptional({
    description: 'Статусы',
    example: [TaskStatus.NOT_STARTED],
    enum: AllowedTaskStatuses,
    isArray: true,
  })
  @Expose()
  @IsOptional()
  @Type(() => String)
  @IsArray()
  @IsIn(AllowedTaskStatuses, { each: true })
  status?: (typeof AllowedTaskStatuses)[number][];

  @ApiPropertyOptional({
    description: 'Начало диапазона (ISO 8601). Должно приходить вместе с filter.to',
    example: '2026-01-01T00:00:00.000Z',
  })
  @Expose()
  @IsOptional()
  @IsISO8601()
  from?: string;

  @ApiPropertyOptional({
    description: 'Конец диапазона (ISO 8601). Должно приходить вместе с filter.from',
    example: '2026-02-01T00:00:00.000Z',
  })
  @Expose()
  @IsOptional()
  @IsISO8601()
  to?: string;
}

class GetTasksQuery extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Поиск по имени',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Параметры сортировки',
    type: GetTasksSortDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => GetTasksSortDto)
  sort: GetTasksSortDto;

  @ApiPropertyOptional({
    description: 'Параметры фильтрации',
    type: GetTasksFilterDto,
  })
  @IsOptional()
  @Validate(BothOrNothing)
  @ValidateNested({ each: true })
  @Type(() => GetTasksFilterDto)
  filter: GetTasksFilterDto;
}

class GetTasksResData {
  @ApiProperty({ description: 'Ответ сервера', type: TaskDto, isArray: true })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => TaskDto)
  @IsArray()
  items: TaskDto[];

  @ApiProperty({
    description: 'Метаинформация',
    type: PaginationResDto,
  })
  @Expose()
  @ValidateNested()
  @Type(() => PaginationResDto)
  meta: PaginationResDto;
}

class GetTasksRes {
  @ApiProperty({ description: 'Ответ сервера', type: GetTasksResData })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => GetTasksResData)
  data: GetTasksResData;
}

export { GetTasksQuery, GetTasksRes, GetTasksSortDto };
