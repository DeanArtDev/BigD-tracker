import { IsEnum, IsInt, IsISO8601, IsNumber, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from '../types';

class TaskDto {
  @IsInt()
  id: number;

  @IsInt()
  userId: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  priority: number;

  @IsNumber()
  weight: number;

  @IsISO8601()
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsISO8601()
  @IsOptional()
  @IsString()
  endDate?: string;

  @IsISO8601()
  @IsOptional()
  @IsString()
  deadline?: string;

  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsOptional()
  @IsString()
  recurrence?: string;

  @IsOptional()
  @IsString()
  cancelReason?: string;
}

export { TaskDto };
