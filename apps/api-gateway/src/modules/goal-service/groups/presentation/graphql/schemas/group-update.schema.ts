import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

@InputType()
class GroupUpdateTaskInput {
  @Field(() => String)
  @IsString()
  id: string;
}

@InputType()
class GroupUpdateInput {
  @Field(() => Int)
  @IsInt()
  id: number;

  @Field(() => String)
  @MaxLength(255)
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description: string | null | undefined;

  @Field(() => [GroupUpdateTaskInput], { nullable: true })
  @ValidateNested({ each: true })
  @Type(() => GroupUpdateTaskInput)
  @IsOptional()
  @IsArray()
  tasks?: GroupUpdateTaskInput[];
}

export { GroupUpdateInput };
