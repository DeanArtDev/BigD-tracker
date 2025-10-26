import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ThingDto } from '../../../things';

class GroupDto {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @MaxLength(255)
  @IsString()
  name: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @IsInt()
  userId: number;

  @Expose()
  @IsOptional()
  @IsInt()
  goalId?: number;

  @Expose()
  @IsInt()
  @Min(0)
  @Max(100)
  result: number;

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => ThingDto)
  @IsArray()
  things: ThingDto[];
}

export { GroupDto };
