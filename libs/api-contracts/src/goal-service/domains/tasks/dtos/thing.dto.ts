import { Expose, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { TaskStatus } from './shared/types';

class TaskDto {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @IsInt()
  userId: number;

  @Expose()
  @MaxLength(255)
  @IsString()
  name: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @IsOptional()
  @Min(0)
  @Max(4)
  @IsInt()
  priority?: number;

  @Expose()
  @Min(0)
  @Max(100)
  @IsInt()
  weight: number;

  @Expose()
  @IsISO8601()
  @IsOptional()
  @IsString()
  startDate?: string;

  @Expose()
  @IsISO8601()
  @IsOptional()
  @IsString()
  endDate?: string;

  @Expose()
  @IsISO8601()
  @IsOptional()
  @IsString()
  deadline?: string;

  @Expose()
  @IsEnum(TaskStatus)
  @Type(() => String)
  status: string;

  @Expose()
  @IsOptional()
  @IsString()
  recurrence?: string;

  @Expose()
  @IsOptional()
  @IsString()
  cancelReason?: string;
}

export { TaskDto };
