import { AvailableToViewTasksStatuses, TaskStatus } from '@big-d/api-contracts';
import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CursorPaginationInput } from '@shared/graphql';
import { IsArray, IsEnum, IsIn, IsOptional, IsString, Length, Max, Min } from 'class-validator';

@ObjectType()
class GetInboxResponse {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => Int)
  taskCount: number;
}

@InputType()
class GetInboxTasksInput extends CursorPaginationInput {
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
  @IsIn(AvailableToViewTasksStatuses, { each: true })
  @IsArray()
  @IsEnum(TaskStatus, { each: true })
  status?: TaskStatus[];
}

export { GetInboxResponse, GetInboxTasksInput };
