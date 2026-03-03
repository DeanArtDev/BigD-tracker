import { TaskDto } from '@transports/rmq/goal-service/tasks/dtos';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { GroupStatus } from '../types';

class GroupDto {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  userId: number;

  @IsNumber()
  progress: number;

  @IsEnum(GroupStatus)
  status: GroupStatus;

  @ValidateNested({ each: true })
  @Type(() => TaskDto)
  @IsArray()
  tasks: TaskDto[];
}

export { GroupDto };
