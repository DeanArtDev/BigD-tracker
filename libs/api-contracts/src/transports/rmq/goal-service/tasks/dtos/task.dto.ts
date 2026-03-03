import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsISO8601, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from '../types';
import { TaskRecurrencyDto } from './task-recurrency.dto';

class TaskDto {
  @IsString()
  id: string;

  @IsInt()
  userId: number;

  @IsOptional()
  @IsInt()
  groupId?: number;

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
  endDate?: string;

  @IsISO8601()
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsISO8601()
  @IsOptional()
  @IsString()
  deadline?: string;

  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsOptional()
  @IsObject()
  @Type(() => TaskRecurrencyDto)
  recurrence?: TaskRecurrencyDto;

  @IsOptional()
  @IsString()
  cancelReason?: string;
}

export { TaskDto };
