import { TaskRecurrencyDto } from '@transports/rmq/goal-service/tasks/dtos/task-recurrency.dto';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsISO8601, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from '../types';

class TaskVirtualDto {
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
  @IsString()
  cancelReason?: string;

  @IsOptional()
  @IsObject()
  @Type(() => TaskRecurrencyDto)
  recurrence?: TaskRecurrencyDto;
}

export { TaskVirtualDto };
