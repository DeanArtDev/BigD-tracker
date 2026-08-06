import { GroupStatus } from '@big-d/api-contracts';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

@ObjectType({ description: 'Настройки группы' })
class GroupSettingsSchema {
  @Field()
  @MaxLength(250)
  @IsString()
  eventColor: string;

  @Field()
  @MaxLength(250)
  @IsString()
  eventSelectedColor: string;

  @Field()
  @MaxLength(250)
  @IsString()
  lineColor: string;

  @Field()
  @MaxLength(250)
  @IsString()
  textColor: string;

  @Field()
  @MaxLength(250)
  @IsString()
  eventColorDark: string;

  @Field()
  @MaxLength(250)
  @IsString()
  eventSelectedColorDark: string;

  @Field()
  @MaxLength(250)
  @IsString()
  lineColorDark: string;

  @Field()
  @MaxLength(250)
  @IsString()
  textColorDark: string;

  @Field()
  @IsBoolean()
  isDefault: boolean;

  @Field()
  @IsBoolean()
  isVisible: boolean;

  @Field()
  @IsBoolean()
  isReadonly: boolean;
}

@ObjectType({ description: 'Группа' })
class GroupSchema {
  @Field(() => Int)
  @IsInt()
  id: number;

  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int)
  @IsInt()
  userId: number;

  @Field(() => Int)
  @Min(0)
  @Max(100)
  @IsInt()
  progress: number;

  @Field(() => GroupStatus)
  @IsEnum(GroupStatus)
  status: GroupStatus;

  @Field(() => GroupSettingsSchema, { nullable: true })
  settings?: GroupSettingsSchema;
}

export { GroupSchema, GroupSettingsSchema };
