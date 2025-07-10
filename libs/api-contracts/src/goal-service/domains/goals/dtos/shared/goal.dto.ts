import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { GroupDto } from '../../../groups';

class GoalDto {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @MaxLength(255)
  @IsString()
  name: string;

  @Expose()
  @IsInt()
  userId: number;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(4)
  priority?: number;

  @Expose()
  @IsISO8601()
  @IsString()
  @IsOptional()
  startDate?: string;

  @Expose()
  @IsISO8601()
  @IsString()
  @IsOptional()
  endDate?: string;

  @Expose()
  @IsISO8601()
  @IsString()
  @IsOptional()
  deadline?: string;

  @Expose()
  @IsInt()
  @Min(0)
  @Max(100)
  result: number;

  @Expose()
  @IsOptional()
  @IsString()
  comment?: string;

  @Expose()
  @Type(() => GroupDto)
  @ValidateNested({ each: true })
  @IsArray()
  groups: GroupDto[];
}

export { GoalDto };
