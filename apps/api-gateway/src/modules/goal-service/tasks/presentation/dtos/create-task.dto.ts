import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import { IsAbsoluteDateTimeWithoutTimezone } from '@shared/validation';
import { TaskRecurrencyDto } from './task-recurrency.dto';
import { buildTaskDateTimeApiProperty } from './task-date-time';
import { TaskDto } from './task.dto';

class CreateTaskReqData {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  groupId?: number;

  @ApiProperty({ example: 'Имя дела' })
  @MaxLength(255)
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 2, description: 'От 1 до 4' })
  @IsOptional()
  @Min(1)
  @Max(4)
  @IsInt()
  priority?: number;

  @ApiPropertyOptional({ example: 100, description: 'От 0 до 100' })
  @IsOptional()
  @Min(0)
  @Max(100)
  @IsInt()
  weight?: number;

  @ApiPropertyOptional({ example: 'Описание дела' })
  @IsOptional()
  @IsString()
  description?: string;

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

class CreateTaskReq {
  @ApiProperty({
    description: 'Запрос сервера',
    type: CreateTaskReqData,
  })
  @ValidateNested()
  @Type(() => CreateTaskReqData)
  data: CreateTaskReqData;
}

class CreateTaskRes {
  @ApiProperty({ description: 'Ответ сервера' })
  @Expose()
  @ValidateNested()
  @Type(() => TaskDto)
  data: TaskDto;
}

export { CreateTaskReq, CreateTaskRes };
