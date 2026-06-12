import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { buildTaskDateTimeApiProperty } from '@shared/dto/task-date-time';
import { IsAbsoluteDateTimeWithoutTimezone } from '@shared/validation';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

@InputType()
class TaskCreateInput {
  @ApiPropertyOptional({ example: 1 })
  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsInt()
  groupId?: number;

  @ApiProperty({ example: 'Имя дела' })
  @Field(() => String)
  @MaxLength(255)
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 2, description: 'От 1 до 4' })
  @Field(() => Number)
  @IsOptional()
  @Min(1)
  @Max(4)
  @IsInt()
  priority?: number;

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
