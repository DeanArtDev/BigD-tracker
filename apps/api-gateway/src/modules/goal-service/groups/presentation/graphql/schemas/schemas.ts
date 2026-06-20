import { GroupTaskOrder } from '@big-d/api-contracts';
import { Field, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

@ObjectType()
class GroupInfoDto {
  @Field(() => Int)
  @IsInt()
  id: number;

  @Field(() => String)
  @IsString()
  name: string;
}

registerEnumType(GroupTaskOrder, { name: 'GroupTaskOrder', description: 'Порядок дел внутри группы' });

@InputType()
class GetGroupTasksInput {
  @Field(() => GroupTaskOrder, { nullable: true })
  @IsOptional()
  @IsEnum(GroupTaskOrder)
  order?: GroupTaskOrder;
}

export { GroupInfoDto, GetGroupTasksInput };
