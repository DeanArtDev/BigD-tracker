import { Field, ID, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
class TaskSettingsUpdateInput {
  @Field(() => ID)
  @IsString()
  taskId: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isAllDay?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(50)
  @IsString()
  icon?: string | null;
}

export { TaskSettingsUpdateInput };
