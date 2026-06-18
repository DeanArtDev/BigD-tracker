import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Min } from 'class-validator';

@ObjectType()
class GetPlannerInit {
  @Field(() => Int)
  @Min(1)
  inboxId: number;

  @Field(() => Int)
  inboxTaskCount: number;
}

export { GetPlannerInit };
