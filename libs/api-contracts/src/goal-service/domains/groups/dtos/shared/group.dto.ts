import { TaskDto } from '@transports/rmq/goal-service/tasks/dtos';
import { GroupStatus } from '../../../../../transports/rmq/goal-service/groups';
import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class GroupDto {
  @IsInt()
  id: number;

  @MaxLength(255)
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  userId: number;

  @IsInt()
  progress: number;

  @IsEnum(GroupStatus)
  @Type(() => String)
  status: GroupStatus;

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => TaskDto)
  @IsArray()
  things: TaskDto[];
}

export { GroupDto };
