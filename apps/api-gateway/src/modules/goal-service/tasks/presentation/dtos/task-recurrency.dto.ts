import { RecurrenceFrequency, TaskRecurrenceWeekday } from '@big-d/api-contracts';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray, IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';

class TaskRecurrencyDto {
  @ApiPropertyOptional({
    example: RecurrenceFrequency.DAILY,
    description: 'Частота',
    enum: RecurrenceFrequency,
  })
  @Expose()
  @IsOptional()
  @IsEnum(RecurrenceFrequency)
  frequency?: RecurrenceFrequency;

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

  @ApiProperty({
    example: '2025-06-24T13:01:02.471Z',
    description: 'День начала повторения',
  })
  @Expose()
  @IsISO8601()
  @IsString()
  start: string;

  @ApiPropertyOptional({
    example: '2026-05-24T13:01:02.471Z',
    description: 'День окончания повторения',
  })
  @Expose()
  @IsISO8601()
  @IsOptional()
  @IsString()
  end?: string;
}

export { TaskRecurrencyDto };
