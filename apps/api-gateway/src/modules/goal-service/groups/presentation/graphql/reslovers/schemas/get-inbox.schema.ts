import { TaskSchema } from './task.schema';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
class GetInboxResponse {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => [TaskSchema], { nullable: 'items' })
  tasks: TaskSchema[];
}

export { GetInboxResponse };
