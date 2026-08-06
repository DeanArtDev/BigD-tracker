import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
class GroupSettingsUpdateInput {
  @Field(() => Int)
  @IsInt()
  groupId: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(250)
  @IsString()
  eventColor?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(250)
  @IsString()
  eventSelectedColor?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(250)
  @IsString()
  lineColor?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(250)
  @IsString()
  textColor?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(250)
  @IsString()
  eventColorDark?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(250)
  @IsString()
  eventSelectedColorDark?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(250)
  @IsString()
  lineColorDark?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(250)
  @IsString()
  textColorDark?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isReadonly?: boolean;
}

export { GroupSettingsUpdateInput };
