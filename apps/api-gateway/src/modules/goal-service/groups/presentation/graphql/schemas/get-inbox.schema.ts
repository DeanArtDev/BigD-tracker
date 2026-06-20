import { TaskSchema } from '@/modules/goal-service/tasks';
import { AvailableInboxTasksStatuses, TaskStatus } from '@big-d/api-contracts';
import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsEnum, IsIn, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

@ObjectType()
class GetInboxResponse {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => Int)
  taskCount: number;
}

@ObjectType()
class GetInboxMeta {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  endCursor?: string;

  @Field(() => Boolean)
  @IsBoolean()
  hasNextPage: boolean;
}

@ObjectType()
class TasksConnection {
  @Field(() => [TaskSchema])
  items: TaskSchema[];

  @Field(() => GetInboxMeta)
  meta: GetInboxMeta;
}

@InputType()
class GetInboxTasksInput {
  @Field(() => Int)
  @Min(1)
  @IsOptional()
  @IsInt()
  limit?: number;

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
  priority?: number[];

  @Field(() => [TaskStatus], { nullable: true })
  @IsOptional()
  @IsIn(AvailableInboxTasksStatuses, { each: true })
  @IsArray()
  @IsEnum(TaskStatus, { each: true })
  status?: TaskStatus[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  cursor?: string;
}

export { GetInboxResponse, GetInboxTasksInput, TasksConnection };
