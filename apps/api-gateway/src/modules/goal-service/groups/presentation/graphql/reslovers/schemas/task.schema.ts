import { TaskStatus } from '@big-d/api-contracts';
import { Field, Float, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

registerEnumType(TaskStatus, {
  name: 'TaskStatus',
  description: 'Статусы дела',
});

@ObjectType({ description: 'Дело' })
class TaskSchema {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => Float)
  userId: number;

  @Field(() => Float, { nullable: true })
  groupId?: number;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float)
  priority: number;

  @Field(() => Float)
  weight: number;

  @Field({ nullable: true })
  endDate?: string;

  @Field({ nullable: true })
  deadline?: string;

  @Field({ nullable: true })
  startDate?: string;

  @Field(() => TaskStatus)
  status: TaskStatus;

  @Field({ nullable: true })
  cancelReason?: string;
}

export { TaskSchema };
