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
import { ExerciseType } from '../../exercises';
import { TrainingType } from '../../trainings';
import { TrainingTemplateWithExercisesResSingle } from './shared/training-templates-response.dto';

class Repetition {
  @Expose()
  @IsOptional()
  @IsInt()
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
  @IsEnum(TrainingType)
  @Type(() => String)
  type: TrainingType;

  @IsString()
  @Expose()
  name: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @IsOptional()
  @IsInt()
  wormUpDuration?: number;

  @Expose()
  @IsOptional()
  @IsInt()
  postTrainingDuration?: number;

  @IsArray()
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => Exercise)
  exercises: Exercise[];
}

class UpdateTemplateReq {
  @Expose()
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class UpdateTemplateRes extends TrainingTemplateWithExercisesResSingle {}

export { UpdateTemplateReq, UpdateTemplateRes };
