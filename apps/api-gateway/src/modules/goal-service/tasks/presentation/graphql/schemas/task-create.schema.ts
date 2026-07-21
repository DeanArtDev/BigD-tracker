import { TaskPriority } from '@big-d/api-contracts';
import { Field, InputType, Int } from '@nestjs/graphql';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { buildTaskDateTimeApiProperty } from '@shared/dto/task-date-time';
import { IsAbsoluteDateTimeWithoutTimezone } from '@shared/validation';
import { IsEnum, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
class TaskCreateInput {
  @ApiPropertyOptional({ example: 1 })
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  groupId?: number;

  @ApiProperty({ example: 'Имя дела' })
  @Field(() => String)
  @MaxLength(255)
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 2, description: 'От 1 до 4' })
  @IsOptional()
  @Field(() => TaskPriority)
  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @ApiPropertyOptional({ example: 'Описание дела' })
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional(buildTaskDateTimeApiProperty())
  @Field(() => String, { nullable: true })
  @IsAbsoluteDateTimeWithoutTimezone()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional(buildTaskDateTimeApiProperty())
  @Field(() => String, { nullable: true })
  @IsAbsoluteDateTimeWithoutTimezone()
  @IsOptional()
  @IsString()
  deadline?: string;
}

export { TaskCreateInput };
