import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';
import { RecurrenceFrequency } from '../types';

class TaskRecurrencyDto {
  @IsOptional()
  @IsEnum(RecurrenceFrequency)
  frequency?: RecurrenceFrequency;

  @IsISO8601()
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsISO8601()
  @IsOptional()
  @IsString()
  deadline?: string;
}

export { TaskRecurrencyDto };
