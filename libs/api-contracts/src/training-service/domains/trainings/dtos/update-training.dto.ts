import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { ExerciseType } from '../../exercises';
import { TrainingType } from './shared/training.dto';
import { TrainingWithExercisesResSingle } from './shared/trainings-response.dto';

class Repetition {
  @Expose()
  @IsInt()
  @IsOptional()
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

class Exercise {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @IsEnum(ExerciseType)
  @Type(() => String)
  type: ExerciseType;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @IsUrl({ protocols: ['https'] })
  @IsOptional()
  @IsString()
  exampleUrl?: string;

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => Repetition)
  @IsArray()
  repetitions: Repetition[];
}

class ReqData {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @IsInt()
  userId: number;

  @Expose()
  @Type(() => String)
  @IsEnum(TrainingType)
  type: TrainingType;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsOptional()
  @IsInt()
  wormUpDuration?: number;

  @Expose()
  @IsOptional()
  @IsInt()
  postTrainingDuration?: number;

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => Exercise)
  @IsArray()
  exercises: Exercise[];
}

class UpdateTrainingReq {
  @Expose()
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class UpdateTrainingRes extends TrainingWithExercisesResSingle {}

export { UpdateTrainingReq, UpdateTrainingRes };
