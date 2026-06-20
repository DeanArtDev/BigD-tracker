import { TaskStatus } from '@big-d/api-contracts';
import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { IsAbsoluteDateTimeWithoutTimezone } from '@shared/validation';

registerEnumType(TaskStatus, {
  name: 'TaskStatus',
  description: 'Статусы дела',
});

@ObjectType({ description: 'Дело' })
class TaskSchema {
  @Field(() => ID)
  @IsString()
  @MaxLength(255)
  id: string;

  @Field()
  @IsString()
  name: string;

  @Field(() => Int)
  @IsInt()
  userId: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  groupId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int)
  @Min(1)
  @Max(4)
  @IsInt()
  priority: number;

  @Field(() => Int)
  @Min(0)
  @Max(100)
  @IsInt()
  weight: number;

  @Field({ nullable: true })
  @IsAbsoluteDateTimeWithoutTimezone()
  @IsOptional()
  @IsString()
  endDate?: string;

  @Field({ nullable: true })
  @IsAbsoluteDateTimeWithoutTimezone()
  @IsOptional()
  @IsString()
  deadline?: string;

  @Field({ nullable: true })
  @IsAbsoluteDateTimeWithoutTimezone()
  @IsOptional()
  @IsString()
  startDate?: string;

  @Field(() => TaskStatus)
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  cancelReason?: string;
}

export { TaskSchema };
