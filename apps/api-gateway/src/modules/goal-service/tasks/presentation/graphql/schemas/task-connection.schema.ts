import { Field, ObjectType } from '@nestjs/graphql';
import { CursorPaginationMeta } from '@shared/graphql';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { TaskSchema } from './task.schema';

@ObjectType()
class TasksConnection {
  @Field(() => [TaskSchema])
  @ValidateNested({ each: true })
  @Type(() => TaskSchema)
  @IsArray()
  items: TaskSchema[];

  @Field(() => CursorPaginationMeta)
  @ValidateNested()
  @Type(() => CursorPaginationMeta)
  meta: CursorPaginationMeta;
}

export { TasksConnection };
