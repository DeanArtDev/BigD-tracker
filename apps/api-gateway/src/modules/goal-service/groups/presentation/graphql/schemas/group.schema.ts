import { GroupStatus } from '@big-d/api-contracts';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

@ObjectType({ description: 'Группа' })
class GroupSchema {
  @Field(() => Int)
  @IsInt()
  id: number;

  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int)
  @IsInt()
  userId: number;

  @Field(() => Int)
  @Min(0)
  @Max(100)
  @IsInt()
  progress: number;

  @Field(() => GroupStatus)
  @IsEnum(GroupStatus)
  status: GroupStatus;
}

export { GroupSchema };
