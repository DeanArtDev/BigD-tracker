import { RecurrenceFrequency } from '@big-d/api-contracts';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';

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

  @ApiPropertyOptional({ example: '2025-06-24T13:01:02.471Z' })
  @Expose()
  @IsISO8601()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-05-24T13:01:02.471Z' })
  @Expose()
  @IsISO8601()
  @IsOptional()
  @IsString()
  deadline?: string;
}

export { TaskRecurrencyDto };
