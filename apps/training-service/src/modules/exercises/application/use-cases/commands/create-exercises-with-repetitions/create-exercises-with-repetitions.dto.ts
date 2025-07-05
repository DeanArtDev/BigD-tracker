import { ExerciseType } from '@big-d/api-contracts';
import { RepetitionFinishType } from '@modules/repetitions';
import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

class CreateRepetition {
  @IsString()
  @Expose()
  @IsOptional()
  description?: string;

  @Type(() => String)
  @IsEnum(RepetitionFinishType)
  @IsOptional()
  @Expose()
  finishType?: RepetitionFinishType;

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

class CreateExercise {
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
}

class CreateExerciseWithRepetitionsData extends CreateExercise {
  @Expose()
  @IsArray()
  @Type(() => CreateRepetition)
  @ValidateNested({ each: true })
  repetitions: CreateRepetition[];
}

class CreateExerciseWithRepetitionsRequest {
  @ValidateNested()
  @Type(() => CreateExerciseWithRepetitionsData)
  data: CreateExerciseWithRepetitionsData;
}

export { CreateExerciseWithRepetitionsRequest };
