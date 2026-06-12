import { TaskSchema } from '@/modules/goal-service/tasks';
import { TaskStatus } from '@big-d/api-contracts';
import { Field, Int, InputType, ObjectType } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

@ObjectType()
class GetInboxResponse {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => Number)
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
  @Field(() => Number)
  @Min(1)
  @IsOptional()
  @IsInt()
  limit?: number;

  @Field(() => String, { nullable: true })
  @Length(0, 50)
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => [Number], { nullable: true })
  @Min(1, { each: true })
  @Max(4, { each: true })
  @IsOptional()
  @IsArray()
  priority?: number[];

  @Field(() => [TaskStatus], { nullable: true })
  @IsOptional()
  @IsEnum(TaskStatus, { each: true })
  @IsArray()
  status?: TaskStatus[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  cursor?: string;
}

export { GetInboxResponse, GetInboxTasksInput, TasksConnection };
