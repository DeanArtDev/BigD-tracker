import { ExerciseType } from '@big-d/api-contracts';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';

class PutExerciseRequestData {
  @IsInt()
  @Expose()
  id: number;

  @IsInt()
  @Expose()
  @IsOptional()
  userId?: number;

  @Type(() => String)
  @IsEnum(ExerciseType)
  @Expose()
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

class PutExerciseRequest {
  @ValidateNested()
  @Type(() => PutExerciseRequestData)
  data: PutExerciseRequestData;
}

export { PutExerciseRequest };
