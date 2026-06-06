import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
class GetInboxResponse {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field(() => Number)
  taskCount: number;
}

export { GetInboxResponse };
