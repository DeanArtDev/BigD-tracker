import { TaskRecurrencyDto } from './task-recurrency.dto';
import { TaskDto } from './task.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import { IsAbsoluteDateTimeWithoutTimezone } from '@shared/validation';
import { buildTaskDateTimeApiProperty } from './task-date-time';

class ReplaceTaskReqData {
  @ApiProperty({ example: 'Имя дела' })
  @Expose()
  @MaxLength(255)
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Описание дела' })
  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

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
  startDate?: string;

  @ApiPropertyOptional(buildTaskDateTimeApiProperty())
  @Expose()
  @IsAbsoluteDateTimeWithoutTimezone()
  @IsOptional()
  @IsString()
  deadline?: string;

  @ApiPropertyOptional({
    description: 'Паттерн повторения дела',
    type: TaskRecurrencyDto,
  })
  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => TaskRecurrencyDto)
  recurrence?: TaskRecurrencyDto;
}

class ReplaceTaskReq {
  @ApiProperty({
    description: 'Запрос сервера',
    type: ReplaceTaskReqData,
  })
  @ValidateNested()
  @Type(() => ReplaceTaskReqData)
  data: ReplaceTaskReqData;
}

class ReplaceTaskRes {
  @ApiProperty({ description: 'Ответ сервера' })
  @Expose()
  @ValidateNested()
  @Type(() => TaskDto)
  data: TaskDto;
}

export { ReplaceTaskReq, ReplaceTaskRes };
