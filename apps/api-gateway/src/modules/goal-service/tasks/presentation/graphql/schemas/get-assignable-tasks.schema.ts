import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, Length } from 'class-validator';

@InputType()
class GetAssignableTasksInput {
  @Field(() => String)
  @Length(0, 50)
  @IsString()
  search: string;

  @Field(() => [Int], { nullable: true, description: 'Исключает дела в этих группах из выдачи' })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  groupIds?: number[];
}

export { GetAssignableTasksInput };
