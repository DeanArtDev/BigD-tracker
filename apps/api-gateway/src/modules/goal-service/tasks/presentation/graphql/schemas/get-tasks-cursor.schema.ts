import { TaskPriority, TaskStatus } from '@big-d/api-contracts';
import { Field, InputType, Int } from '@nestjs/graphql';
import { CursorPaginationInput } from '@shared/graphql';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, Length } from 'class-validator';

@InputType()
class GetTasksCursorInput extends CursorPaginationInput {
  @Field(() => String, { nullable: true })
  @Length(0, 50)
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => [TaskPriority], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(TaskPriority, { each: true })
  priority?: TaskPriority[];

  @Field(() => [TaskStatus], { nullable: true })
  @IsOptional()
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

export { GetTasksCursorInput };
