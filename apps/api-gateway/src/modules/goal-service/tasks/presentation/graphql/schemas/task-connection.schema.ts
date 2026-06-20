import { Field, ObjectType } from '@nestjs/graphql';
import { CursorPaginationMeta } from '@shared/graphql';
import { TaskSchema } from './task.schema';

@ObjectType()
class TasksConnection {
  @Field(() => [TaskSchema])
  items: TaskSchema[];

  @Field(() => CursorPaginationMeta)
  meta: CursorPaginationMeta;
}

export { TasksConnection };
