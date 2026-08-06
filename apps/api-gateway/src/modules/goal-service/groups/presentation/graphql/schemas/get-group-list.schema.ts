import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CursorPaginationInput, CursorPaginationMeta } from '@shared/graphql';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { GroupSchema } from './group.schema';

@InputType()
class GetGroupListInput extends CursorPaginationInput {
  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  ids?: number[];

  @Field(() => String, { nullable: true })
  @Length(0, 50)
  @IsOptional()
  @IsString()
  search?: string;
}

@ObjectType()
class GroupsConnection {
  @Field(() => [GroupSchema])
  @ValidateNested({ each: true })
  @Type(() => GroupSchema)
  @IsArray()
  items: GroupSchema[];

  @Field(() => CursorPaginationMeta)
  @ValidateNested()
  @Type(() => CursorPaginationMeta)
  meta: CursorPaginationMeta;
}

export { GetGroupListInput, GroupsConnection };
