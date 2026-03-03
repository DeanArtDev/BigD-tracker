import { Expose, Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { RepetitionFinishType } from '../../repetitions';
import { ExerciseWithRepetitionsResSingle } from './shared/exercise-response';
import { ExerciseType } from './shared/exercise.dto';

class Repetition {
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

class ReqData {
  @IsInt()
  @Expose()
  userId: number;

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
  @IsArray()
  @Type(() => Repetition)
  @ValidateNested({ each: true })
  repetitions: Repetition[];
}

class CreateExerciseReq {
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class CreateExerciseRes extends ExerciseWithRepetitionsResSingle {}

export { CreateExerciseReq, CreateExerciseRes };
