import { Expose, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUrl } from 'class-validator';
import { ExerciseType } from '@big-d/api-contracts';

class ExerciseDto {
  @IsInt()
  @Expose()
  id: number;

  @IsInt()
  @Expose()
  @IsOptional()
  userId?: number;

  @Expose()
  @Type(() => String)
  @IsEnum(ExerciseType)
  type: ExerciseType;

  @IsString()
  @Expose()
  name: string;

  @IsString()
  @Expose()
  @IsOptional()
  description?: string;

  @IsUrl({ protocols: ['https'] })
  @Expose()
  @IsOptional()
  exampleUrl?: string;

  @IsInt()
  @Expose()
  @IsOptional()
  trainingId?: number;

  @IsInt()
  @Expose()
  @IsOptional()
  templateId?: number;
}

export { ExerciseDto };
