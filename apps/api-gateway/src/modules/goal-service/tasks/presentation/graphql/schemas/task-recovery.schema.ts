import { Field, InputType, Int } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

@InputType()
class TaskRecoveryInput {
  @ApiProperty({ example: 'o:1' })
  @Field(() => String)
  @IsString()
  id: string;

  @ApiProperty({ example: 1 })
  @Field(() => Int)
  @IsInt()
  groupId: number;
}

export { TaskRecoveryInput };
