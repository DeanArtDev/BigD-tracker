import { Field, Int, ObjectType } from '@nestjs/graphql';
import { IsInt, IsString } from 'class-validator';

@ObjectType({ description: 'Группа для дел' })
class GroupSchema {
  @Field(() => Int)
  @IsInt()
  id: number;

  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @IsString()
  description?: string;
}

export { GroupSchema };
