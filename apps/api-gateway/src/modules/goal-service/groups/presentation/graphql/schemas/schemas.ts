import { Field, Int, ObjectType } from '@nestjs/graphql';
import { IsInt, IsString } from 'class-validator';

@ObjectType()
class GroupInfoDto {
  @Field(() => Int)
  @IsInt()
  id: number;

  @Field(() => String)
  @IsString()
  name: string;
}

export { GroupInfoDto };
