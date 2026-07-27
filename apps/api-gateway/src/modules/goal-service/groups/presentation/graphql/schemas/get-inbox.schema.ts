import { AvailableToViewTasksStatuses, TaskPriority, TaskStatus } from '@big-d/api-contracts';
import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CursorPaginationInput } from '@shared/graphql';
import { IsArray, IsEnum, IsIn, IsOptional, IsString, Length } from 'class-validator';

@ObjectType()
class GetInboxResponse {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;
}

@InputType()
class GetInboxTasksInput extends CursorPaginationInput {
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
  @IsIn(AvailableToViewTasksStatuses, { each: true })
  @IsArray()
  @IsEnum(TaskStatus, { each: true })
  status?: TaskStatus[];
}

export { GetInboxResponse, GetInboxTasksInput };
