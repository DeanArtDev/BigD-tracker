import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

@InputType()
class TaskCloneInput {
  @ApiProperty({ example: 'o:1' })
  @Field(() => String)
  @IsString()
  id: string;
}

export { TaskCloneInput };
