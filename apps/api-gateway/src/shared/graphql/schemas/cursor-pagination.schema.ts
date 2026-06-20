import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

@InputType({ isAbstract: true })
class CursorPaginationInput {
  @Field(() => Int)
  @Min(1)
  @IsInt()
  limit: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  cursor?: string;
}

@ObjectType()
class CursorPaginationMeta {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  endCursor?: string;

  @Field(() => Boolean)
  @IsBoolean()
  hasNextPage: boolean;
}

export { CursorPaginationInput, CursorPaginationMeta };
