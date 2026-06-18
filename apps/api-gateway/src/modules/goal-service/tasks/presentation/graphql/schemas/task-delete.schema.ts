import { Field, InputType } from '@nestjs/graphql';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

@InputType()
class TaskDeleteInput {
  @ApiPropertyOptional({ example: 'o:1' })
  @Field(() => String)
  @IsOptional()
  @IsString()
  id: string;
}

export { TaskDeleteInput };
