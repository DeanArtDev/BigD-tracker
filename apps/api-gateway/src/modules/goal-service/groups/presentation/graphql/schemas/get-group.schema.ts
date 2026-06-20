import { GroupStatus } from '@big-d/api-contracts';
import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';
import { IsInt } from 'class-validator';

registerEnumType(GroupStatus, {
  name: 'GroupStatus',
  description: 'Статусы группы',
});

@InputType()
class GetGroupInput {
  @Field(() => Int)
  @IsInt()
  groupId: number;
}

export { GetGroupInput };
