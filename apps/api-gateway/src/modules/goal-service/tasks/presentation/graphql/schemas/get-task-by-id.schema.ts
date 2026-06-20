import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
class GetTaskByIdInput {
  @Field(() => String)
  @IsString()
  id: string;
}

export { GetTaskByIdInput };
