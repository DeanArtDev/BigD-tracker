import { IsArray, IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';
import { RecurrenceFrequency, TaskRecurrenceWeekday } from '../types';

class TaskRecurrencyDto {
  @IsOptional()
  @IsEnum(RecurrenceFrequency)
  frequency?: RecurrenceFrequency;

  @IsOptional()
  @IsEnum(TaskRecurrenceWeekday, { each: true })
  @IsArray()
  weekdays?: TaskRecurrenceWeekday[];

  @IsISO8601()
  @IsString()
  start: string;

  @IsISO8601()
  @IsOptional()
  @IsString()
  end?: string;
}

export { TaskRecurrencyDto };
