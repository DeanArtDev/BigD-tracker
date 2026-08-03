import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsArray, IsISO8601, IsInt, IsOptional } from 'class-validator';

@InputType()
class GetDiaryTasksInput {
  @Field(() => String, { description: 'Начало диапазона дат' })
  @IsISO8601()
  from: string;

  @Field(() => String, { description: 'Конец диапазона дат' })
  @IsISO8601()
  to: string;

  @Field(() => [Int], { nullable: true, description: 'IDs групп' })
  @IsOptional()
  @Type(() => Number)
  @IsArray()
  @IsInt({ each: true })
  group?: number[];
}

export { GetDiaryTasksInput };
