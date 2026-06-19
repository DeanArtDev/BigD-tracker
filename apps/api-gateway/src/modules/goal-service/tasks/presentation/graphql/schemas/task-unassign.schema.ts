import { Field, InputType, Int } from '@nestjs/graphql';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

@InputType()
class TaskUnassignInput {
  @ApiPropertyOptional({ example: '1' })
  @Field(() => String)
  @IsString()
  taskId: string;

  @ApiPropertyOptional({ example: 1 })
  @Field(() => Int)
  @IsInt()
  groupId: number;
}

export { TaskUnassignInput };
