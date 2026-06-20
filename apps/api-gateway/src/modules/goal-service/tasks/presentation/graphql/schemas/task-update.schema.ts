import { Field, InputType, Int } from '@nestjs/graphql';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import { buildTaskDateTimeApiProperty } from '@shared/dto/task-date-time';
import { IsAbsoluteDateTimeWithoutTimezone } from '@shared/validation';
import { TaskRecurrencyInput } from './task-recurrency.schema';

@InputType()
class TaskUpdateInput {
  @ApiProperty({ example: 'o:1' })
  @Field(() => String)
  @IsString()
  id: string;

  @ApiProperty({ example: 'Имя дела' })
  @Field(() => String)
  @MaxLength(255)
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Описание дела' })
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 2, description: 'От 1 до 4' })
  @Field(() => Int)
  @Min(1)
  @Max(4)
  @IsInt()
  priority: number;

  @ApiProperty({ example: 100, description: 'От 0 до 100' })
  @Field(() => Int)
  @Min(0)
  @Max(100)
  @IsInt()
  weight: number;

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

  @ApiPropertyOptional({
    description: 'Паттерн повторения дела',
    type: TaskRecurrencyInput,
  })
  @Field(() => TaskRecurrencyInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => TaskRecurrencyInput)
  recurrence?: TaskRecurrencyInput;
}

export { TaskUpdateInput };
