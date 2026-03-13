import { TaskStatus } from '@big-d/api-contracts';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { IsAbsoluteDateTimeWithoutTimezone } from '@shared/validation';
import { TaskRecurrencyDto } from './task-recurrency.dto';
import { buildTaskDateTimeApiProperty } from './task-date-time';

class TaskDto {
  @ApiProperty({
    example: 't:4',
    description: 't:4 - это реальное дело, v:4:2026.02.02 - виртуальная',
  })
  @Expose()
  @IsString()
  id: string;

  @ApiProperty({ example: 'Имя дела' })
  @Expose()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Описание' })
  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  userId: number;

  @ApiPropertyOptional({ example: 1 })
  @Expose()
  @IsOptional()
  @IsInt()
  groupId?: number;

  @ApiProperty({ example: 2, description: 'От 1 до 4' })
  @Expose()
  @Min(1)
  @Max(4)
  @IsInt()
  priority: number;

  @ApiPropertyOptional(buildTaskDateTimeApiProperty())
  @Expose()
  @IsAbsoluteDateTimeWithoutTimezone()
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional(buildTaskDateTimeApiProperty())
  @Expose()
  @IsAbsoluteDateTimeWithoutTimezone()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional(buildTaskDateTimeApiProperty())
  @Expose()
  @IsAbsoluteDateTimeWithoutTimezone()
  @IsOptional()
  @IsString()
  deadline?: string;

  @ApiProperty({ example: 100, description: 'От 0 до 100' })
  @Expose()
  @Min(0)
  @Max(100)
  @IsNumber()
  weight: number;

  @ApiPropertyOptional({ example: 'Описание причины не выполнения дела' })
  @Expose()
  @IsOptional()
  @IsString()
  cancelReason?: string;

  @ApiProperty({
    example: TaskStatus.NOT_STARTED,
    description: 'Статус дела',
    enum: TaskStatus,
  })
  @Expose()
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @ApiPropertyOptional({
    type: TaskRecurrencyDto,
    description: 'Паттерн повторения дела',
  })
  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => TaskRecurrencyDto)
  recurrence?: TaskRecurrencyDto;
}

export { TaskDto };
