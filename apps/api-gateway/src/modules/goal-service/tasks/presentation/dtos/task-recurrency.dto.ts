import { RecurrenceFrequency, TaskRecurrenceWeekday } from '@big-d/api-contracts';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { IsAbsoluteDateTimeWithoutTimezone } from '@shared/validation';
import { buildTaskDateTimeApiProperty } from './task-date-time';

class TaskRecurrencyDto {
  @ApiProperty({
    example: RecurrenceFrequency.DAILY,
    description: 'Частота',
    enum: RecurrenceFrequency,
  })
  @Expose()
  @IsEnum(RecurrenceFrequency)
  frequency: RecurrenceFrequency;

  @ApiPropertyOptional({
    example: [TaskRecurrenceWeekday.MO, TaskRecurrenceWeekday.TH],
    description: 'Дни недели',
    enum: TaskRecurrenceWeekday,
    isArray: true,
  })
  @Expose()
  @IsOptional()
  @IsArray()
  @IsEnum(TaskRecurrenceWeekday, { each: true })
  weekdays?: TaskRecurrenceWeekday[];

  @ApiProperty(buildTaskDateTimeApiProperty('День начала повторения'))
  @Expose()
  @IsAbsoluteDateTimeWithoutTimezone()
  @IsString()
  startDate: string;

  @ApiPropertyOptional(buildTaskDateTimeApiProperty('День окончания повторения'))
  @Expose()
  @IsAbsoluteDateTimeWithoutTimezone()
  @IsOptional()
  @IsString()
  untilDate?: string;

  @ApiPropertyOptional({
    example: [1, 15],
    description: 'Дни месяца',
  })
  @Expose()
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  monthdays?: number[];

  @ApiPropertyOptional({
    example: [1, 4],
    description: 'Месяцы года',
  })
  @Expose()
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  yearmonths?: number[];

  @ApiPropertyOptional({
    example: 3,
    description: 'Интервал повторения (каждые n дней/недель/месяцев/лет)',
  })
  @Expose()
  @IsOptional()
  @IsInt()
  interval?: number;
}

export { TaskRecurrencyDto };
