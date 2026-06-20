import { AvailableInboxTasksStatuses, TaskStatus } from '@big-d/api-contracts';
import { Field, InputType, Int } from '@nestjs/graphql';
import { CursorPaginationInput } from '@shared/graphql';
import { IsArray, IsEnum, IsIn, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

@InputType()
class GetTasksInput extends CursorPaginationInput {
  @Field(() => String, { nullable: true })
  @Length(0, 50)
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => [Int], { nullable: true })
  @Min(1, { each: true })
  @Max(4, { each: true })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  priority?: number[];

  @Field(() => [TaskStatus], { nullable: true })
  @IsOptional()
  @IsIn(AvailableInboxTasksStatuses, { each: true })
  @IsArray()
  @IsEnum(TaskStatus, { each: true })
  status?: TaskStatus[];

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  groupIds?: number[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ids?: string[];
}

export { GetTasksInput };
