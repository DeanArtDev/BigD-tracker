import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';

@InputType()
class GroupDeleteInput {
  @Field(() => Int)
  @Min(1)
  @IsInt()
  groupId: number;
}

export { GroupDeleteInput };
