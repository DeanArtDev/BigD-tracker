import { IsArray, IsEnum, IsInt, IsISO8601, IsOptional, IsString } from 'class-validator';
import { RecurrenceFrequency, TaskRecurrenceWeekday } from '../types';

class TaskRecurrencyDto {
  @IsEnum(RecurrenceFrequency)
  frequency: RecurrenceFrequency;

  @IsOptional()
  @IsEnum(TaskRecurrenceWeekday, { each: true })
  @IsArray()
  weekdays?: TaskRecurrenceWeekday[];

  @IsOptional()
  @IsInt()
  interval?: number;

  @IsISO8601()
  @IsString()
  startDate: string;

  @IsISO8601()
  @IsOptional()
  @IsString()
  untilDate?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  monthdays?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  yearmonths?: number[];
}

export { TaskRecurrencyDto };
