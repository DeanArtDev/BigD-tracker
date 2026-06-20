import { TaskStatus } from '@big-d/api-contracts';
import { Field, Float, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { IsAbsoluteDateTimeWithoutTimezone } from '@shared/validation';

registerEnumType(TaskStatus, {
  name: 'TaskStatus',
  description: 'Статусы дела',
});

@ObjectType({ description: 'Дело' })
class TaskSchema {
  @Field(() => ID)
  @IsString()
  id: string;

  @Field()
  @IsString()
  name: string;

  @Field(() => Float)
  @IsInt()
  userId: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsInt()
  groupId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Float)
  @Min(1)
  @Max(4)
  @IsInt()
  priority: number;

  @Field(() => Float)
  @Min(0)
  @Max(100)
  @IsNumber()
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
