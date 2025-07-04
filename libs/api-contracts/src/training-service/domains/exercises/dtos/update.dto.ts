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
import { ExerciseWithRepetitionsResSingle } from './shared/exercise-response';
import { ExerciseType } from './shared/exercise.dto';

class Repetition {
  @IsInt()
  @IsOptional()
  @Expose()
  id?: number;

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

class ReqData {
  @IsInt()
  @Expose()
  id: number;

  @IsInt()
  @Expose()
  userId: number;

  @Expose()
  @Type(() => String)
  @IsEnum(ExerciseType)
  type: ExerciseType;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  @IsOptional()
  description?: string;

  @Expose()
  @IsUrl({ protocols: ['https'] })
  @IsOptional()
  exampleUrl?: string;

  @Expose()
  @Type(() => Repetition)
  @IsArray()
  @ValidateNested({ each: true })
  repetitions: Repetition[];
}

class UpdateExerciseReq {
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class UpdateExerciseRes extends ExerciseWithRepetitionsResSingle {}

export { UpdateExerciseReq, UpdateExerciseRes };
