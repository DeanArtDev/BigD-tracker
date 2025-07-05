import { ExerciseType } from '@big-d/api-contracts';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';

class UpdateRepetition {
  @IsInt()
  @IsOptional()
  @Expose()
  id?: number;

  @IsInt()
  @Expose()
  exerciseId: number;

  @IsInt()
  @Expose()
  targetCount: number;

  @IsString()
  @Expose()
  targetWeight: string;

  @IsInt()
  @Expose()
  targetBreak: number;
}

class UpdateExerciseWithRepetitionsData {
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

  @Expose()
  @Type(() => UpdateRepetition)
  @ValidateNested({ each: true })
  repetitions: UpdateRepetition[];
}

class UpdateExerciseWithRepetitionsRequest {
  @ValidateNested()
  @Type(() => UpdateExerciseWithRepetitionsData)
  data: UpdateExerciseWithRepetitionsData;
}

export { UpdateExerciseWithRepetitionsRequest };
