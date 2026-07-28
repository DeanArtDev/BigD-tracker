import { SortDirection, TaskPriority, TaskStatus } from '@big-d/api-contracts';
import { Field, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Length, Min, ValidateNested } from 'class-validator';
import { TaskSchema } from './task.schema';

registerEnumType(SortDirection, {
  name: 'SortDirection',
  description: 'Направление сортировки',
});

@InputType()
class GetTasksPerPageSortInput {
  @Field(() => SortDirection, { nullable: true })
  @IsOptional()
  @IsEnum(SortDirection)
  priority?: SortDirection;

  @Field(() => SortDirection, { nullable: true })
  @IsOptional()
  @IsEnum(SortDirection)
  deadline?: SortDirection;

  @Field(() => SortDirection, { nullable: true })
  @IsOptional()
  @IsEnum(SortDirection)
  startDate?: SortDirection;
}

@InputType()
class GetTasksPerPageInput {
  @Field(() => Int)
  @Min(1)
  @IsInt()
  page: number;

  @Field(() => Int)
  @Min(1)
  @IsInt()
  perPage: number;

  @Field(() => String, { nullable: true })
  @Length(0, 50)
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => GetTasksPerPageSortInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => GetTasksPerPageSortInput)
  sort?: GetTasksPerPageSortInput;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  recurring?: boolean;

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

@ObjectType()
class TasksPerPageMeta {
  @Field(() => Boolean)
  @IsBoolean()
  nextPage: boolean;
}

@ObjectType()
class TasksPerPageConnection {
  @Field(() => [TaskSchema])
  @ValidateNested({ each: true })
  @Type(() => TaskSchema)
  @IsArray()
  items: TaskSchema[];

  @Field(() => TasksPerPageMeta)
  @ValidateNested()
  @Type(() => TasksPerPageMeta)
  meta: TasksPerPageMeta;
}

export { GetTasksPerPageInput, GetTasksPerPageSortInput, TasksPerPageConnection, TasksPerPageMeta };
