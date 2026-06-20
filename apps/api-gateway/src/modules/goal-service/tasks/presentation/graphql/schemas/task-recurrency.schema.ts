import { RecurrenceFrequency, TaskRecurrenceWeekday } from '@big-d/api-contracts';
import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { buildTaskDateTimeApiProperty } from '@shared/dto/task-date-time';
import { IsAbsoluteDateTimeWithoutTimezone } from '@shared/validation';
import { IsArray, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

registerEnumType(RecurrenceFrequency, {
  name: 'RecurrenceFrequency',
  description: 'Частота повторения дела',
});

registerEnumType(TaskRecurrenceWeekday, {
  name: 'TaskRecurrenceWeekday',
  description: 'День недели повторения дела',
});

@InputType()
class TaskRecurrencyInput {
  @ApiProperty({
    example: RecurrenceFrequency.DAILY,
    description: 'Частота',
    enum: RecurrenceFrequency,
  })
  @Field(() => RecurrenceFrequency)
  @IsEnum(RecurrenceFrequency)
  frequency: RecurrenceFrequency;

  @ApiPropertyOptional({
    example: [TaskRecurrenceWeekday.MO, TaskRecurrenceWeekday.TH],
    description: 'Дни недели',
    enum: TaskRecurrenceWeekday,
    isArray: true,
  })
  @Field(() => [TaskRecurrenceWeekday], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(TaskRecurrenceWeekday, { each: true })
  weekdays?: TaskRecurrenceWeekday[];

  @ApiProperty(buildTaskDateTimeApiProperty('День начала повторения'))
  @Field(() => String)
  @IsAbsoluteDateTimeWithoutTimezone()
  @IsString()
  startDate: string;

  @ApiPropertyOptional(buildTaskDateTimeApiProperty('День окончания повторения'))
  @Field(() => String, { nullable: true })
  @IsAbsoluteDateTimeWithoutTimezone()
  @IsOptional()
  @IsString()
  untilDate?: string;

  @ApiPropertyOptional({
    example: [1, 15],
    description: 'Дни месяца',
  })
  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  monthdays?: number[];

  @ApiPropertyOptional({
    example: [1, 4],
    description: 'Месяцы года',
  })
  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  yearmonths?: number[];

  @ApiPropertyOptional({
    example: 3,
    description: 'Интервал повторения (каждые n дней/недель/месяцев/лет)',
  })
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  interval?: number;
}

export { TaskRecurrencyInput };
